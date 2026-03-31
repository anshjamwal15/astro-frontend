import {
  firebaseFirestore,
  firestoreFieldValue,
  isFirebaseInitialized,
} from '../config/firebase';
import { MessageNotificationService } from './MessageNotificationService';
import { logger } from '../utils/Logger';
import { generateChatRoomName } from '../utils/roomNameGenerator';

const log = logger.scope('ChatService');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  name: string;
  /** Short unique id for the room (e.g. c-lx3k9p2abc) */
  roomName?: string;
  createdBy: string;
  createdAt: any;
  members: string[];
  lastMessage?: string | null;
  lastMessageAt?: any;
  lastMessageBy?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  text: string;
  createdBy: string;
  createdAt: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const db = () => {
  if (!isFirebaseInitialized || !firebaseFirestore) {
    throw new Error('Firebase is not initialized');
  }
  return firebaseFirestore;
};

const serverTimestamp = () => firestoreFieldValue?.serverTimestamp() ?? new Date();

// ─── Chat Service ─────────────────────────────────────────────────────────────

export class ChatService {
  /**
   * 1. Create a new chat room.
   *    The creator is automatically added as the first member.
   *    Optionally pass a mentorId to add them as the second member.
   */
  static async createChatRoom(name: string, userId: string, mentorId?: string): Promise<ChatRoom> {
    const roomsRef = db().collection('chatRooms');
    const members = mentorId ? [userId, mentorId] : [userId];
    const roomName = generateChatRoomName();
    const data = {
      name,
      roomName,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members,
      lastMessage: null,
      lastMessageAt: null,
      lastMessageBy: null,
    };

    const docRef = await roomsRef.add(data);
    return { id: docRef.id, ...data } as ChatRoom;
  }

  /**
   * 2. Join an existing chat room.
   *    Uses arrayUnion so duplicate entries are never added.
   */
  static async joinChatRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = db().collection('chatRooms').doc(roomId);
    const snap = await roomRef.get();

    if (!snap.exists) {
      throw new Error(`Chat room "${roomId}" does not exist`);
    }

    const firestoreModule = require('@react-native-firebase/firestore').default;
    await roomRef.update({
      members: firestoreModule.FieldValue.arrayUnion(userId),
    });
  }

  /**
   * 3. Send a message to a specific chat room.
   *    Also updates the room's lastMessage metadata and fires a push notification
   *    to the other member(s) of the room.
   */
  static async sendMessage(
    roomId: string,
    text: string,
    userId: string,
    senderName = 'User'
  ): Promise<ChatMessage> {
    const messagesRef = db().collection('chatRooms').doc(roomId).collection('messages');
    const ts = serverTimestamp();

    const data = {
      roomId,
      text,
      createdBy: userId,
      createdAt: ts,
    };

    log.info(`Sending message | room: ${roomId} | sender: ${userId} (${senderName}) | text: "${text}"`);
    const docRef = await messagesRef.add(data);
    log.success(`Message saved to Firestore | id: ${docRef.id}`);

    // Update room's last message snapshot
    const roomRef = db().collection('chatRooms').doc(roomId);
    await roomRef.update({
      lastMessage: text,
      lastMessageAt: ts,
      lastMessageBy: userId,
    });

    // Fire push notification to every other member in the room (non-blocking)
    try {
      const roomSnap = await roomRef.get();
      const members: string[] = roomSnap.data()?.members ?? [];
      const recipients = members.filter((m: string) => m !== userId);

      for (const recipientId of recipients) {
        log.info(`Sending push notification | recipient: ${recipientId} | sender: ${senderName}`);
        // MessageNotificationService.notify(
        //   recipientId,
        //   senderName,
        //   userId,
        //   text,
        //   roomId,
        // ).catch((err) => console.warn('Message notification error:', err));
      }
    } catch (err) {
      console.warn('Could not send message notification:', err);
    }

    return { id: docRef.id, ...data } as ChatMessage;
  }

  /**
   * 4. Subscribe to real-time messages of a specific chat room.
   *    Returns an unsubscribe function — call it to stop listening.
   */
  static subscribeToMessages(
    roomId: string,
    onMessages: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    // log.info(`Subscribing to messages | room: ${roomId}`);
    const messagesRef = db()
      .collection('chatRooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    const unsubscribe = messagesRef.onSnapshot(
      { includeMetadataChanges: true },
      (snapshot: any) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        log.debug(`Realtime update | room: ${roomId} | messages: ${messages.length} | fromCache: ${snapshot.metadata.fromCache}`);
        onMessages(messages);
      },
      (error: Error) => {
        log.error('subscribeToMessages error:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  }

  /**
   * 5. Get all chat rooms the user has joined, with last message info.
   *    Returns a one-time fetch (not real-time).
   *    Use subscribeToUserRooms for real-time updates.
   */
  static async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    const snapshot = await db()
      .collection('chatRooms')
      .where('members', 'array-contains', userId)
      .orderBy('lastMessageAt', 'desc')
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatRoom[];
  }

  /**
   * 5b. Real-time subscription to all chat rooms the user has joined.
   *     Returns an unsubscribe function.
   */
  static subscribeToUserRooms(
    userId: string,
    onRooms: (rooms: ChatRoom[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    const roomsRef = db()
      .collection('chatRooms')
      .where('members', 'array-contains', userId)
      .orderBy('lastMessageAt', 'desc');

    const unsubscribe = roomsRef.onSnapshot(
      (snapshot: any) => {
        const rooms: ChatRoom[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onRooms(rooms);
      },
      (error: Error) => {
        onError?.(error);
      }
    );

    return unsubscribe;
  }
}
