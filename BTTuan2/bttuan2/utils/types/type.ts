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