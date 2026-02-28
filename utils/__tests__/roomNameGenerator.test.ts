/**
 * Test file for Room Name Generator
 * 
 * To run tests:
 * npm test utils/__tests__/roomNameGenerator.test.ts
 */

import {
  generateVideoRoomName,
  generateVoiceRoomName,
  generateChatRoomName,
  generateSessionId,
  generateCallId,
  isValidRoomName,
} from '../roomNameGenerator';

describe('Room Name Generator', () => {
  describe('generateVideoRoomName', () => {
    it('should generate a room name with max 20 characters', () => {
      const roomName = generateVideoRoomName();
      expect(roomName.length).toBeLessThanOrEqual(20);
      expect(roomName.length).toBeGreaterThan(0);
    });

    it('should start with "v-" prefix', () => {
      const roomName = generateVideoRoomName();
      expect(roomName).toMatch(/^v-/);
    });

    it('should generate unique room names', () => {
      const roomName1 = generateVideoRoomName();
      const roomName2 = generateVideoRoomName();
      expect(roomName1).not.toBe(roomName2);
    });

    it('should generate 10 unique room names', () => {
      const roomNames = new Set();
      for (let i = 0; i < 10; i++) {
        roomNames.add(generateVideoRoomName());
      }
      expect(roomNames.size).toBe(10);
    });
  });

  describe('generateVoiceRoomName', () => {
    it('should generate a room name with max 20 characters', () => {
      const roomName = generateVoiceRoomName();
      expect(roomName.length).toBeLessThanOrEqual(20);
      expect(roomName.length).toBeGreaterThan(0);
    });

    it('should start with "a-" prefix', () => {
      const roomName = generateVoiceRoomName();
      expect(roomName).toMatch(/^a-/);
    });

    it('should generate unique room names', () => {
      const roomName1 = generateVoiceRoomName();
      const roomName2 = generateVoiceRoomName();
      expect(roomName1).not.toBe(roomName2);
    });
  });

  describe('generateChatRoomName', () => {
    it('should generate a room name with max 20 characters', () => {
      const roomName = generateChatRoomName();
      expect(roomName.length).toBeLessThanOrEqual(20);
      expect(roomName.length).toBeGreaterThan(0);
    });

    it('should start with "c-" prefix', () => {
      const roomName = generateChatRoomName();
      expect(roomName).toMatch(/^c-/);
    });

    it('should generate unique room names', () => {
      const roomName1 = generateChatRoomName();
      const roomName2 = generateChatRoomName();
      expect(roomName1).not.toBe(roomName2);
    });
  });

  describe('generateSessionId', () => {
    it('should generate video session ID with max 20 characters', () => {
      const sessionId = generateSessionId('video');
      expect(sessionId.length).toBeLessThanOrEqual(20);
      expect(sessionId).toMatch(/^vid-/);
    });

    it('should generate voice session ID with max 20 characters', () => {
      const sessionId = generateSessionId('voice');
      expect(sessionId.length).toBeLessThanOrEqual(20);
      expect(sessionId).toMatch(/^voc-/);
    });

    it('should generate chat session ID with max 20 characters', () => {
      const sessionId = generateSessionId('chat');
      expect(sessionId.length).toBeLessThanOrEqual(20);
      expect(sessionId).toMatch(/^cht-/);
    });

    it('should generate unique session IDs', () => {
      const sessionId1 = generateSessionId('video');
      const sessionId2 = generateSessionId('video');
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('generateCallId', () => {
    it('should generate a call ID with max 20 characters', () => {
      const callId = generateCallId();
      expect(callId.length).toBeLessThanOrEqual(20);
      expect(callId.length).toBeGreaterThan(0);
    });

    it('should generate unique call IDs', () => {
      const callId1 = generateCallId();
      const callId2 = generateCallId();
      expect(callId1).not.toBe(callId2);
    });

    it('should generate 100 unique call IDs', () => {
      const callIds = new Set();
      for (let i = 0; i < 100; i++) {
        callIds.add(generateCallId());
      }
      expect(callIds.size).toBe(100);
    });
  });

  describe('isValidRoomName', () => {
    it('should validate room names with 20 or fewer characters', () => {
      expect(isValidRoomName('v-abc123')).toBe(true);
      expect(isValidRoomName('a-xyz789')).toBe(true);
      expect(isValidRoomName('12345678901234567890')).toBe(true); // exactly 20
    });

    it('should reject room names with more than 20 characters', () => {
      expect(isValidRoomName('123456789012345678901')).toBe(false); // 21 chars
      expect(isValidRoomName('this-is-a-very-long-room-name')).toBe(false);
    });

    it('should reject empty room names', () => {
      expect(isValidRoomName('')).toBe(false);
    });
  });

  describe('Real-world examples', () => {
    it('should generate valid room names for all types', () => {
      const videoRoom = generateVideoRoomName();
      const voiceRoom = generateVoiceRoomName();
      const chatRoom = generateChatRoomName();
      const videoSession = generateSessionId('video');
      const callId = generateCallId();

      console.log('Example room names:');
      console.log('  Video room:', videoRoom, `(${videoRoom.length} chars)`);
      console.log('  Voice room:', voiceRoom, `(${voiceRoom.length} chars)`);
      console.log('  Chat room:', chatRoom, `(${chatRoom.length} chars)`);
      console.log('  Video session:', videoSession, `(${videoSession.length} chars)`);
      console.log('  Call ID:', callId, `(${callId.length} chars)`);

      expect(isValidRoomName(videoRoom)).toBe(true);
      expect(isValidRoomName(voiceRoom)).toBe(true);
      expect(isValidRoomName(chatRoom)).toBe(true);
      expect(isValidRoomName(videoSession)).toBe(true);
      expect(isValidRoomName(callId)).toBe(true);
    });
  });
});

/**
 * Manual Testing Examples:
 * 
 * Run this in a Node.js console or React Native debugger:
 * 
 * import {
 *   generateVideoRoomName,
 *   generateVoiceRoomName,
 *   generateChatRoomName,
 *   generateSessionId,
 *   generateCallId,
 * } from './utils/roomNameGenerator';
 * 
 * // Generate examples
 * console.log('Video room:', generateVideoRoomName());
 * // Output: "v-lx3k9p2abc" (11-15 chars)
 * 
 * console.log('Voice room:', generateVoiceRoomName());
 * // Output: "a-lx3k9p2def" (11-15 chars)
 * 
 * console.log('Chat room:', generateChatRoomName());
 * // Output: "c-lx3k9p2ghi" (11-15 chars)
 * 
 * console.log('Video session:', generateSessionId('video'));
 * // Output: "vid-lx3k9p2jkl" (13-17 chars)
 * 
 * console.log('Call ID:', generateCallId());
 * // Output: "lx3k9p2mno" (10-14 chars)
 * 
 * // Test uniqueness
 * const rooms = [];
 * for (let i = 0; i < 10; i++) {
 *   rooms.push(generateVideoRoomName());
 * }
 * console.log('10 unique rooms:', rooms);
 * console.log('All unique?', new Set(rooms).size === 10);
 */
