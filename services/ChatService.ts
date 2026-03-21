import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { AUTH_CONFIG } from '../config/auth';
import { CallNotificationService } from './CallNotificationService';

// Derive WS URL from HTTP base URL
const WS_URL = AUTH_CONFIG.API.BASE_URL.replace(/^http/, 'ws') + '/ws/websocket';

export interface ChatRoomResponse {
  id: string;
  name: string;
  participant_ids: string[];
}

export interface ChatMessageResponse {
  chat_room_id: string;
  sender_user_id: string;
  content: string;
  sent_at: string;
}

type RoomUpdateCallback = (room: ChatRoomResponse) => void;
type MessageCallback = (msg: ChatMessageResponse) => void;
type RoomListCallback = (rooms: ChatRoomResponse[]) => void;

class ChatService {
  private client: Client | null = null;
  private connected = false;
  private connectCallbacks: Array<() => void> = [];
  private subscriptions: Map<string, StompSubscription> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client?.active) {
        resolve();
        return;
      }

      this.client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ STOMP connected');
          this.connected = true;
          this.connectCallbacks.forEach(cb => cb());
          this.connectCallbacks = [];
          resolve();
        },
        onDisconnect: () => {
          console.log('🔌 STOMP disconnected');
          this.connected = false;
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          reject(new Error(frame.headers?.message || 'STOMP connection error'));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          reject(new Error('WebSocket connection failed'));
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    this.subscriptions.forEach(sub => {
      try { sub.unsubscribe(); } catch {}
    });
    this.subscriptions.clear();
    this.client?.deactivate();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && (this.client?.active ?? false);
  }

  // Subscribe to global room updates (create/join/leave broadcasts)
  subscribeToRoomUpdates(callback: RoomUpdateCallback): () => void {
    const dest = '/topic/chatrooms';
    const sub = this.client!.subscribe(dest, (msg: IMessage) => {
      try {
        callback(JSON.parse(msg.body) as ChatRoomResponse);
      } catch (e) {
        console.error('Failed to parse room update:', e);
      }
    });
    this.subscriptions.set(dest, sub);
    return () => {
      sub.unsubscribe();
      this.subscriptions.delete(dest);
    };
  }

  // Subscribe to messages in a specific room
  subscribeToRoomMessages(chatRoomId: string, callback: MessageCallback): () => void {
    const dest = `/topic/chatrooms/${chatRoomId}`;
    const sub = this.client!.subscribe(dest, (msg: IMessage) => {
      try {
        callback(JSON.parse(msg.body) as ChatMessageResponse);
      } catch (e) {
        console.error('Failed to parse chat message:', e);
      }
    });
    this.subscriptions.set(dest, sub);
    return () => {
      sub.unsubscribe();
      this.subscriptions.delete(dest);
    };
  }

  // Subscribe to per-user room list responses
  subscribeToUserRooms(callback: RoomListCallback): () => void {
    const dest = '/user/queue/chatrooms';
    const sub = this.client!.subscribe(dest, (msg: IMessage) => {
      try {
        callback(JSON.parse(msg.body) as ChatRoomResponse[]);
      } catch (e) {
        console.error('Failed to parse room list:', e);
      }
    });
    this.subscriptions.set(dest, sub);
    return () => {
      sub.unsubscribe();
      this.subscriptions.delete(dest);
    };
  }

  // Send a chat message to a room and notify the recipient via push
  async sendMessage(chatRoomId: string, senderUserId: string, content: string) {
    this.client!.publish({
      destination: '/app/chat/send',
      body: JSON.stringify({
        chat_room_id: chatRoomId,
        sender_user_id: senderUserId,
        content,
      }),
    });
  }

  /**
   * Send a push notification to the recipient so they can join the room.
   * POST /api/notifications/message
   */
  async sendMessageNotification(params: {
    recipientMentorId: string;
    senderName: string;
    senderId: string;
    chatRoomId: string;
    message: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const deviceToken = await CallNotificationService.getDeviceToken(params.recipientMentorId);
      if (!deviceToken) {
        console.warn('No device token for recipient, skipping push notification');
        return { success: false, message: 'No device token found' };
      }

      const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/api/notifications/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          device_token: deviceToken,
          senderName: params.senderName,
          senderId: params.senderId,
          chatRoomId: params.chatRoomId,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn('Message notification failed:', response.status, text);
        return { success: false, message: text };
      }

      console.log('✅ Message notification sent');
      return { success: true };
    } catch (error: any) {
      console.error('Error sending message notification:', error);
      return { success: false, message: error.message };
    }
  }

  // Create a room via socket
  createRoom(name: string) {
    this.client!.publish({
      destination: '/app/chatrooms/create',
      body: JSON.stringify({ name }),
    });
  }

  // Join a room via socket
  joinRoom(chatRoomId: string, userId: string) {
    this.client!.publish({
      destination: '/app/chatrooms/join',
      body: JSON.stringify({ chat_room_id: chatRoomId, user_id: userId }),
    });
  }

  // Leave a room via socket
  leaveRoom(chatRoomId: string, userId: string) {
    this.client!.publish({
      destination: '/app/chatrooms/leave',
      body: JSON.stringify({ chat_room_id: chatRoomId, user_id: userId }),
    });
  }

  // Request user's room list via socket
  listUserRooms(userId: string) {
    this.client!.publish({
      destination: '/app/chatrooms/listForUser',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  // Request all rooms via socket
  listAllRooms() {
    this.client!.publish({
      destination: '/app/chatrooms/listAll',
      body: '',
    });
  }
}

// Singleton
export const chatService = new ChatService();
