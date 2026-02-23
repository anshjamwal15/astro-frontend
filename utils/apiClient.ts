import { AUTH_CONFIG } from '../config/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Client with JWT Token Authentication
 * 
 * This utility provides helper functions for making authenticated API calls
 * with automatic JWT token injection.
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Get the stored JWT token
 */
export const getJwtToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
};

/**
 * Make an authenticated API request with JWT token
 * 
 * @param endpoint - API endpoint (e.g., '/api/user/profile')
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with response data
 */
export const authenticatedFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = await getJwtToken();
    
    if (!token) {
      return {
        error: 'No authentication token found',
        status: 401,
      };
    }

    const url = `${AUTH_CONFIG.API.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('API request error:', error);
    return {
      error: error.message || 'Network error',
      status: 500,
    };
  }
};

/**
 * GET request with authentication
 */
export const apiGet = async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(endpoint, { method: 'GET' });
};

/**
 * POST request with authentication
 */
export const apiPost = async <T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * PUT request with authentication
 */
export const apiPut = async <T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request with authentication
 */
export const apiDelete = async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
  return authenticatedFetch<T>(endpoint, { method: 'DELETE' });
};

/**
 * Example Usage:
 * 
 * // Get user profile
 * const { data, error } = await apiGet('/api/user/user@example.com');
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('User data:', data);
 * }
 * 
 * // Update user profile
 * const { data, error } = await apiPut('/api/user/update', {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   mobile: '9876543210',
 * });
 * 
 * // In a React component:
 * import { apiGet } from '../utils/apiClient';
 * 
 * const MyComponent = () => {
 *   const [userData, setUserData] = useState(null);
 * 
 *   useEffect(() => {
 *     const fetchUser = async () => {
 *       const { data, error } = await apiGet('/api/user/user@example.com');
 *       if (data) {
 *         setUserData(data);
 *       }
 *     };
 *     fetchUser();
 *   }, []);
 * 
 *   return <View>...</View>;
 * };
 */
