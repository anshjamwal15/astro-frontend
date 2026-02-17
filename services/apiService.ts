import { AUTH_CONFIG } from '../config/auth';
import { ensureUUID } from '../utils/uuid';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
}

export interface NotificationData {
  title: string;
  message: string;
  userId?: string;
  type?: string;
}

export interface UserData {
  id?: string;
  name: string;
  email: string;
  mobile?: string;
  country?: string;
  password?: string;
  method?: string;
  token?: string;
  userType?: string;
  profileCompleted?: boolean;
}

export interface MentorData {
  id?: number;
  name: string;
  email?: string;
  mobile?: string;
  specialization?: string;
  experience?: number;
  rating?: number;
  isAvailable?: boolean;
}

export interface MessageData {
  content: string;
  senderId: string;
  chatRoomId: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
}

export interface VideoSessionData {
  userId: string;
  mentorId: string;
  sessionType: 'AUDIO_CALL' | 'VIDEO_CALL';
}

export interface WalletData {
  userId: string;
  amount: number;
  method: string;
}

export class ApiService {
  private static baseUrl = AUTH_CONFIG.API.BASE_URL;

  // Helper method for making API calls
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          ...(options.body && { 'Content-Type': 'application/json' }),
          ...options.headers,
        },
        body: options.body,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Get response as text first to check what we actually received
      const responseText = await response.text();
      console.log('Response received (first 100 chars):', responseText.substring(0, 100));

      if (!response.ok) {
        console.error('API Error Response:', responseText);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Request failed',
        };
      }

      // Handle empty responses
      if (response.status === 204 || responseText.length === 0) {
        return {
          success: true,
          data: null as T,
          message: 'Request successful',
        };
      }

      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<') || responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('⚠️ Server returned HTML instead of JSON');
        return {
          success: false,
          error: 'Server Error',
          message: 'Server returned an error page instead of data. Please check server status.',
        };
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log('✅ JSON parsed successfully');
        return {
          success: true,
          data,
          message: 'Request successful',
        };
      } catch (parseError: any) {
        console.error('❌ JSON Parse failed:', parseError.message);
        console.error('Raw response:', responseText.substring(0, 200));
        return {
          success: false,
          error: 'Invalid Response',
          message: 'Server returned invalid data format',
        };
      }

    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  // ===== HELLO WORLD CONTROLLER =====
  static async getHello(): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/api/hello');
  }

  static async generatePasswordHash(password: string): Promise<ApiResponse<string>> {
    return this.makeRequest<string>(`/api/generate-password-hash?password=${encodeURIComponent(password)}`);
  }

  // ===== USER CONTROLLER =====
  
  /**
   * POST /api/user/register - Create a new user
   */
  static async registerUser(userData: UserData): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * POST /api/user/login - User login
   */
  static async loginUser(loginData: {
    email: string;
    password?: string;
    method?: string;
    token?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  /**
   * PUT /api/user/update - Update user profile
   */
  static async updateUserProfile(userData: {
    email: string;
    name?: string;
    mobile?: string;
    country?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/user/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * GET /api/user/{email} - Get user by email
   */
  static async getUserByEmail(email: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/user/${encodeURIComponent(email)}`);
  }

  /**
   * DELETE /api/user/{id} - Delete user by ID
   */
  static async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // ===== MENTOR CONTROLLER =====
  
  /**
   * POST /api/mentor/register - Register a new mentor
   */
  static async registerMentor(mentorData: {
    name: string;
    email: string;
    mobile: number;
    country: string;
    password: string;
    category?: string;
    experience?: number;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/mentor/register', {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  }

  /**
   * POST /api/mentor/login - Mentor login
   */
  static async loginMentor(loginData: {
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/mentor/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  /**
   * GET /api/mentor/email/{email} - Get mentor by email
   */
  static async getMentorByEmail(email: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/mentor/email/${encodeURIComponent(email)}`);
  }

  /**
   * GET /api/mentor/list - Get all mentors
   */
  static async getMentors(): Promise<ApiResponse<MentorData[]>> {
    try {
      const url = `${this.baseUrl}/api/mentor/list`;
      console.log('Fetching mentors from:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to fetch mentors',
        };
      }
      
      // Parse JSON
      try {
        const data = JSON.parse(responseText);
        console.log(`✅ Successfully fetched ${data.length} mentors`);
        return {
          success: true,
          data,
          message: 'Mentors fetched successfully',
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      console.error('Network error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * GET /api/mentor/{id} - Get mentor by ID
   */
  static async getMentorById(id: number | string): Promise<ApiResponse<MentorData>> {
    // If it's a UUID string, use the UUID endpoint, otherwise use numeric ID
    const isUuid = typeof id === 'string' && id.includes('-');
    const endpoint = isUuid ? `/api/mentor/uuid/${id}` : `/api/mentor/${id}`;
    return this.makeRequest<MentorData>(endpoint);
  }

  /**
   * POST /api/mentor - Create mentor (Admin only)
   */
  static async createMentor(mentorData: MentorData): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/mentor', {
      method: 'POST',
      body: JSON.stringify(mentorData),
    });
  }

  /**
   * PUT /api/mentor/{id} - Update mentor (Admin only)
   */
  static async updateMentor(id: number, mentorData: Partial<MentorData>): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/mentor/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mentorData),
    });
  }

  /**
   * DELETE /api/mentor/delete/{name} - Delete mentor
   */
  static async deleteMentor(name: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/mentor/delete/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  // ===== MESSAGE CONTROLLER =====
  
  /**
   * POST /api/messages - Send a message
   */
  static async sendMessage(messageData: MessageData): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        ...messageData,
        messageType: messageData.messageType || 'TEXT',
      }),
    });
  }

  /**
   * GET /api/messages/chatroom/{chatRoomId} - Get chat room messages
   */
  static async getChatRoomMessages(chatRoomId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/messages/chatroom/${encodeURIComponent(chatRoomId)}`);
  }

  /**
   * GET /api/messages/chatroom/{chatRoomId}/paginated - Get paginated messages
   */
  static async getChatRoomMessagesPaginated(
    chatRoomId: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/messages/chatroom/${encodeURIComponent(chatRoomId)}/paginated?page=${page}&size=${size}`);
  }

  /**
   * GET /api/messages/chatroom/{chatRoomId}/count - Get message count
   */
  static async getMessageCount(chatRoomId: string): Promise<ApiResponse<number>> {
    return this.makeRequest<number>(`/api/messages/chatroom/${encodeURIComponent(chatRoomId)}/count`);
  }

  // ===== CHAT ROOM CONTROLLER =====
  
  /**
   * POST /api/chatrooms - Create chat room
   */
  static async createChatRoom(name: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/chatrooms', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * GET /api/chatrooms - Get all chat rooms
   */
  static async getAllChatRooms(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/chatrooms');
  }

  /**
   * GET /api/chatrooms/user/{userId} - Get user chat rooms
   */
  static async getUserChatRooms(userId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/chatrooms/user/${encodeURIComponent(userId)}`);
  }

  /**
   * GET /api/chatrooms/{chatRoomId} - Get chat room details
   */
  static async getChatRoom(chatRoomId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/chatrooms/${encodeURIComponent(chatRoomId)}`);
  }

  /**
   * POST /api/chatrooms/{chatRoomId}/join/{userId} - Join chat room
   */
  static async joinChatRoom(chatRoomId: string, userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/chatrooms/${encodeURIComponent(chatRoomId)}/join/${encodeURIComponent(userId)}`, {
      method: 'POST',
    });
  }

  /**
   * POST /api/chatrooms/{chatRoomId}/leave/{userId} - Leave chat room
   */
  static async leaveChatRoom(chatRoomId: string, userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/chatrooms/${encodeURIComponent(chatRoomId)}/leave/${encodeURIComponent(userId)}`, {
      method: 'POST',
    });
  }

  // ===== VIDEO SESSION CONTROLLER =====
  
  /**
   * POST /api/video_sessions/create - Create video session
   */
  static async createVideoSession(sessionData: VideoSessionData): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/video_sessions/create`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: sessionData.userId,
          mentor_id: sessionData.mentorId,
          room_id: `${sessionData.sessionType.toLowerCase()}_${sessionData.userId}_${sessionData.mentorId}_${Date.now()}`,
          meta: JSON.stringify({ sessionType: sessionData.sessionType })
        }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to create video session',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Video session created successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * GET /api/video_sessions/{userId} - Get user video sessions
   */
  static async getUserVideoSessions(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const url = `${this.baseUrl}/api/video_sessions/${userId}`;
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to get video sessions',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Video sessions retrieved successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * POST /api/video_sessions/join - Join video session
   */
  static async joinVideoSession(roomId: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/video_sessions/join`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to join video session',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Joined video session successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * POST /api/video_sessions/end - End video session
   */
  static async endVideoSession(roomId: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/video_sessions/end`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to end video session',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Video session ended successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  // ===== WALLET CONTROLLER =====
  
  /**
   * GET /api/wallet/balance/{userId} - Get wallet balance
   */
  static async getWalletBalance(userId: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/wallet/balance/${userId}`;
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to get wallet balance',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Wallet balance retrieved successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * POST /api/wallet/add-money - Add money to wallet
   */
  static async addMoneyToWallet(walletData: WalletData): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/wallet/add-money`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: walletData.userId,
          amount: walletData.amount,
          method: walletData.method,
        }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to add money',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Money added successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  /**
   * POST /api/wallet/transactions - Get wallet transactions
   */
  static async getWalletTransactions(userId: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.baseUrl}/api/wallet/transactions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: responseText || 'Failed to get transactions',
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: 'Transactions retrieved successfully',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response',
          message: 'Server returned invalid data',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        message: 'Failed to connect to server',
      };
    }
  }

  // ===== BILLING CONTROLLER =====
  
  /**
   * POST /api/billing/session/start - Start billing session
   */
  static async startBillingSession(sessionData: {
    sessionId: string;
    userId: string;
    mentorId: string;
    sessionType: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/billing/session/start', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  /**
   * POST /api/billing/session/end - End billing session
   */
  static async endBillingSession(sessionData: {
    sessionId: string;
    userId: string;
    mentorId: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/billing/session/end', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  /**
   * GET /api/billing/session/{sessionId}/status - Check session status
   */
  static async checkSessionStatus(sessionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/billing/session/${encodeURIComponent(sessionId)}/status`);
  }

  /**
   * GET /api/billing/rates - Get billing rates
   */
  static async getBillingRates(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/billing/rates');
  }

  // ===== BOOKING CONTROLLER =====
  
  /**
   * POST /api/bookings - Create booking
   */
  static async createBooking(bookingData: {
    userId: string;
    mentorId: string;
    serviceType: string;
    scheduledTime: string;
    duration: number;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  /**
   * GET /api/bookings/user/{userId} - Get user bookings
   */
  static async getUserBookings(userId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/bookings/user/${encodeURIComponent(userId)}`);
  }

  /**
   * GET /api/bookings/mentor/{mentorId} - Get mentor bookings
   */
  static async getMentorBookings(mentorId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/bookings/mentor/${encodeURIComponent(mentorId)}`);
  }

  // ===== CATEGORY CONTROLLER =====
  
  /**
   * POST /api/category - Create category
   */
  static async createCategory(categoryData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/category', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * GET /api/category/list - Get all categories
   */
  static async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return this.makeRequest<Category[]>('/api/category/list');
  }

  /**
   * GET /api/category/{name} - Get category by name
   */
  static async getCategoryByName(name: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/category/${encodeURIComponent(name)}`);
  }

  /**
   * PUT /api/category/{name} - Update category
   */
  static async updateCategory(name: string, categoryData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/category/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * DELETE /api/category/delete/{name} - Delete category
   */
  static async deleteCategory(name: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/category/delete/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  // ===== MENU CONTROLLER =====
  
  /**
   * GET /api/menu/list - Get all menu items
   */
  static async getAllMenuItems(): Promise<ApiResponse<MenuItem[]>> {
    return this.makeRequest<MenuItem[]>('/api/menu/list');
  }

  /**
   * DELETE /api/menu/delete/{text} - Delete menu item
   */
  static async deleteMenuItem(text: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/menu/delete/${encodeURIComponent(text)}`, {
      method: 'DELETE',
    });
  }

  // ===== NOTIFICATION CONTROLLER =====
  
  /**
   * POST /api/notify/send - Send notification
   */
  static async sendNotification(notificationData: NotificationData): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/notify/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // ===== APP NOTIFICATIONS CONTROLLER =====
  
  /**
   * GET /api/notifications/user/{userId} - Get user notifications
   */
  static async getUserNotifications(userId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/notifications/user/${encodeURIComponent(userId)}`);
  }

  /**
   * POST /api/notifications/mark-read/{notificationId} - Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/notifications/mark-read/${encodeURIComponent(notificationId)}`, {
      method: 'POST',
    });
  }

  // ===== OTP CONTROLLER =====
  
  /**
   * POST /api/otp/send - Send OTP
   */
  static async sendOTP(phoneNumber: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  /**
   * POST /api/otp/verify - Verify OTP
   */
  static async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  // ===== FAVORITES CONTROLLER =====
  
  /**
   * POST /api/favorites/add - Add favorite mentor
   */
  static async addFavoriteMentor(userId: string, mentorId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ userId, mentorId }),
    });
  }

  /**
   * DELETE /api/favorites/remove - Remove favorite mentor
   */
  static async removeFavoriteMentor(userId: string, mentorId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/favorites/remove', {
      method: 'DELETE',
      body: JSON.stringify({ userId, mentorId }),
    });
  }

  /**
   * GET /api/favorites/user/{userId} - Get user favorites
   */
  static async getUserFavorites(userId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/favorites/user/${encodeURIComponent(userId)}`);
  }

  // ===== REVIEWS CONTROLLER =====
  
  /**
   * POST /api/reviews - Submit review
   */
  static async submitReview(reviewData: {
    userId: string;
    mentorId: string;
    rating: number;
    comment: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  /**
   * GET /api/reviews/mentor/{mentorId} - Get mentor reviews
   */
  static async getMentorReviews(mentorId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/reviews/mentor/${encodeURIComponent(mentorId)}`);
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Test mentor endpoint specifically
   */
  static async testMentorEndpoint(): Promise<ApiResponse<any>> {
    try {
      console.log('=== MENTOR ENDPOINT TEST ===');
      const url = `${this.baseUrl}/api/mentor/list`;
      console.log('Testing mentor URL:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      console.log('Mentor test - Status:', response.status);
      console.log('Mentor test - Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Mentor test - Response (first 200 chars):', responseText.substring(0, 200));
      
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          message: `Server error: ${responseText}`,
        };
      }
      
      // Check if it's HTML
      if (responseText.trim().startsWith('<')) {
        return {
          success: false,
          error: 'HTML Response',
          message: 'Server returned HTML instead of JSON',
        };
      }
      
      // Try to parse JSON
      try {
        const data = JSON.parse(responseText);
        return {
          success: true,
          data,
          message: `✅ Mentor endpoint working - ${data.length} mentors found`,
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'JSON Parse Error',
          message: `Invalid JSON: ${responseText.substring(0, 100)}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Network error',
      };
    }
  }
  static async testConnection(): Promise<ApiResponse<string>> {
    try {
      console.log('=== API CONNECTION TEST ===');
      console.log('Base URL being used:', this.getBaseUrl());
      
      // Test with a simple fetch first
      const url = `${this.baseUrl}/api/hello`;
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      console.log('Direct test - Status:', response.status);
      console.log('Direct test - Response:', responseText);
      
      if (response.ok && responseText === 'Hello World!') {
        return {
          success: true,
          data: 'Connection successful',
          message: `✅ Connected to ${this.baseUrl}`,
        };
      } else {
        return {
          success: false,
          data: 'Connection failed',
          error: `Unexpected response: ${responseText}`,
          message: `❌ Server returned: ${responseText}`,
        };
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      return {
        success: false,
        data: 'Connection failed',
        error: error.message || 'Network error',
        message: `❌ Cannot connect to ${this.baseUrl}`,
      };
    }
  }

  // Legacy methods for backward compatibility
  static async getAdvisors(): Promise<ApiResponse<MentorData[]>> {
    return this.getMentors();
  }

  static async getAstrologyServices(): Promise<ApiResponse<Category[]>> {
    return this.getAllCategories();
  }

  static async uploadProfilePicture(email: string, imageData: string): Promise<ApiResponse<any>> {
    return this.updateUserProfile({
      email,
      // Note: Profile picture upload might need a separate endpoint
    });
  }
}