import {
  firebaseFirestore,
  firestoreFieldValue,
  isFirebaseInitialized,
} from '../config/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  name: string;
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
   */
  static async createChatRoom(name: string, userId: string): Promise<ChatRoom> {
    const roomsRef = db().collection('chatRooms');
    const data = {
      name,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
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
   *    Also updates the room's lastMessage metadata.
   */
  static async sendMessage(roomId: string, text: string, userId: string): Promise<ChatMessage> {
    const messagesRef = db().collection('chatRooms').doc(roomId).collection('messages');
    const ts = serverTimestamp();

    const data = {
      roomId,
      text,
      createdBy: userId,
      createdAt: ts,
    };

    const docRef = await messagesRef.add(data);

    // Update room's last message snapshot
    await db().collection('chatRooms').doc(roomId).update({
      lastMessage: text,
      lastMessageAt: ts,
      lastMessageBy: userId,
    });

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
    const messagesRef = db()
      .collection('chatRooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'asc');

    const unsubscribe = messagesRef.onSnapshot(
      (snapshot: any) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onMessages(messages);
      },
      (error: Error) => {
        console.error('subscribeToMessages error:', error);
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
        console.error('subscribeToUserRooms error:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  }
}
