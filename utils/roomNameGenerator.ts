/**
 * Utility for generating short, unique room names
 * Maximum length: 20 characters
 */

/**
 * Generate a short unique ID
 * Format: Base36 timestamp + random string
 * Example: "abc123xyz"
 */
function generateShortId(): string {
  const timestamp = Date.now().toString(36); // Convert to base36 (shorter)
  const random = Math.random().toString(36).substring(2, 6); // 4 random chars
  return `${timestamp}${random}`;
}

/**
 * Generate a short room name for video calls
 * Format: "v-{shortId}" (max 20 chars)
 * Example: "v-lx3k9p2abc"
 * 
 * @returns Short unique room name (max 20 characters)
 */
export function generateVideoRoomName(): string {
  const shortId = generateShortId();
  return `v-${shortId}`.substring(0, 20);
}

/**
 * Generate a short room name for voice calls
 * Format: "a-{shortId}" (max 20 chars)
 * Example: "a-lx3k9p2abc"
 * 
 * @returns Short unique room name (max 20 characters)
 */
export function generateVoiceRoomName(): string {
  const shortId = generateShortId();
  return `a-${shortId}`.substring(0, 20);
}

/**
 * Generate a short room name for chat
 * Format: "c-{shortId}" (max 20 chars)
 * Example: "c-lx3k9p2abc"
 * 
 * @returns Short unique room name (max 20 characters)
 */
export function generateChatRoomName(): string {
  const shortId = generateShortId();
  return `c-${shortId}`.substring(0, 20);
}

/**
 * Generate a short session ID
 * Format: "{type}-{shortId}" (max 20 chars)
 * Example: "vid-lx3k9p2abc"
 * 
 * @param type - Session type prefix (vid, voc, cht)
 * @returns Short unique session ID (max 20 characters)
 */
export function generateSessionId(type: 'video' | 'voice' | 'chat'): string {
  const shortId = generateShortId();
  const prefix = type === 'video' ? 'vid' : type === 'voice' ? 'voc' : 'cht';
  return `${prefix}-${shortId}`.substring(0, 20);
}

/**
 * Generate a short call ID
 * Format: "{shortId}" (max 20 chars)
 * Example: "lx3k9p2abc123"
 * 
 * @returns Short unique call ID (max 20 characters)
 */
export function generateCallId(): string {
  return generateShortId().substring(0, 20);
}

/**
 * Validate room name length
 * @param roomName - Room name to validate
 * @returns true if valid (≤20 chars), false otherwise
 */
export function isValidRoomName(roomName: string): boolean {
  return roomName.length > 0 && roomName.length <= 20;
}

/**
 * Example usage:
 * 
 * const videoRoom = generateVideoRoomName();
 * // Output: "v-lx3k9p2abc" (11-15 chars)
 * 
 * const voiceRoom = generateVoiceRoomName();
 * // Output: "a-lx3k9p2def" (11-15 chars)
 * 
 * const chatRoom = generateChatRoomName();
 * // Output: "c-lx3k9p2ghi" (11-15 chars)
 * 
 * const sessionId = generateSessionId('video');
 * // Output: "vid-lx3k9p2jkl" (13-17 chars)
 * 
 * const callId = generateCallId();
 * // Output: "lx3k9p2mno" (10-14 chars)
 */
