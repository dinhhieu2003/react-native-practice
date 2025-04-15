export interface ApiResponse<T> {
  statusCode: number,
  message: string,
  data: T,
  error: string,
}

// ============ Auth =====================

export interface RegisterResponse {
  name: string,
  email: string,
  status: string
}

export interface RegisterRequest {
  name: string,
  email: string,
  password: string
}

export interface VerifyOTPResponse {
  email: string,
  verifyStatus: string,
}

export interface VerifyOTPRequest {
  email: string,
  otp: string,
}

export interface SendOTPRequest {
  email: string;
}

export interface LoginResponse {
  id: number,
  email: string,
  name: string,
  avatar: string,
  accessToken: string,
  role: string,
  isActive: boolean,
}

export interface LoginRequest {
  email: string,
  password: string
}

export interface ResetPasswordRequest {
  email: string,
  password: string,
  passwordConfirm: string,
  otp: string
}

export interface UpdateUserRequest {
  name: string,
  avatar: string
}

export interface ElementType {
  symbol: string,
  name: string,
  atomic_number: number,
  group: number,
  period: number,
  block: string,
  type: string,
}

// ============ Podcasts ===================

export interface Podcast {
  id: number;
  title: string;
  audioUrl: string;
  transcript: string;
  element: string;
  active: boolean;
}

export interface PodcastsApiResponseData {
  meta: {
    current: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  result: Podcast[];
}

export interface PodcastDetail {
  id: number;
  title: string;
  audioUrl: string;
  transcript: string | null; // Transcript can be null
  element: string; // Assuming this is elementName
  active: boolean;
}

// Using the generic ApiResponse for the podcast list
// No need to define a separate PodcastsApiResponse if it follows the standard structure
// If the structure IS different, uncomment and adjust the definition below:
/*
export interface PodcastsApiResponse {
  statusCode: number;
  message: string;
  data: PodcastsApiResponseData;
  error: null | any; // Define a more specific error type if needed
}
*/

// Define a basic type for a *Podcast* comment - adjust based on actual API response
export interface Comment { // Renaming this to PodcastComment for clarity might be better later
  id: number;
  content: string;
  likes: number;
  podcastTitle: string; // Specific to podcast comments
  userName: string;
  userAvatar?: string;
  createdAt: string;
  active: boolean;
}

// Define the structure for the *Podcast* comment list API response data
export interface CommentsApiResponseData {
  result: Comment[];
  meta: {
      // Note: Podcast comments might use 'currentPage' or 'current' - adjust if needed
      currentPage: number; // Or current: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
  };
}


// ============ Element Comments ===================

// Define a specific type for an *Element* comment
export interface ElementComment {
    id: number;
    content: string;
    likes: number;
    elementName: string; // Specific to element comments
    userName: string;
    userAvatar?: string;
    createdAt: string;
    active: boolean;
}

// Define the structure for the *Element* comment list API response data
export interface ElementCommentsApiResponseData {
    result: ElementComment[];
    meta: {
        current: number; // API uses 'current' for page number
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
}

// ============ Notifications ===================

export interface NotificationMeta {
    current: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface NotificationItem {
    id: number;          
    type: string;        // "NEW_PODCAST" or "COMMENT_LIKE_PODCAST or COMMENT_LIKE_ELEMENT"
    message: string;
    relatedId: number;   // Podcast ID or elementId
    createdAt: string;   // ISO 8601 timestamp
    read: boolean;       // Read status
}

export interface NotificationApiResponseData {
    meta: NotificationMeta;
    result: NotificationItem[];
}

// ============ User Profile / History / Favorites ===================

// Define UserProfile based on usage in getUserProfile function
// Adjust fields based on your actual API response
export interface UserProfile {
    id: number;
    email: string;
    name: string;
    avatar: string;
    role: string;
    isActive: boolean;
    // Add other profile fields as needed
}

// Generic Paginated Response structure (used for favorites/history)
export interface PaginatedResponse<T> {
    meta: {
        current: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
    result: T[];
}

// Specific item types for PaginatedResponse
// Adjust fields based on your actual API responses

export interface FavoriteElement {
    image: string;
    elementId: number;
    elementName: string;
    symbol: string;
    // Add other relevant element details if needed
}

export interface FavoritePodcast {
    elementName: string;
    podcastId: number;
    title: string;
    // Add other relevant podcast details if needed
}

export interface ViewedElement {
    elementId: number;
    elementName: string;
    symbol: string;
    image: string;
    lastSeen: string; // ISO 8601 timestamp
}

export interface ViewedPodcast {
    podcastId: number;
    elementName: string;
    title: string;
    lastSeen: string; // ISO 8601 timestamp
}