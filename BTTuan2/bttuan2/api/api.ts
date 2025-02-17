import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, SendOTPRequest, UpdateUserRequest, VerifyOTPRequest, VerifyOTPResponse } from "@/utils/types/type";
import axios from "./axios-customize";

const base_url = process.env.EXPO_PUBLIC_BASE_URL;
const api_url = `${base_url}/api/v1`;

export const register = async(name: string, email: string, password: string): 
                        Promise<ApiResponse<RegisterResponse> | null> => {
    try {
        const registerRequest: RegisterRequest = {
            name: name,
            email: email,
            password: password
        };
        const response = await axios.post(`${api_url}/auth/register`, registerRequest);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        alert(error.response.data.message);
        return null;
    }
}

export const verifyOTP = async (email: string, otp: string):
                        Promise<ApiResponse<VerifyOTPResponse> | null> => {
    try {
        const verifyOTPRequest: VerifyOTPRequest = {
            email: email,
            otp: otp
        }
        const response = await axios.post(`${api_url}/auth/verify`, verifyOTPRequest);
        console.log(response.data);
        return response.data;
    } catch(error: any) {
        alert(error.response.data.message);
        return null;
    }  
}

export const resendOTP = async (email: string):
                        Promise<ApiResponse<any> | null> => {
    try {
        const sendOTPRequest: SendOTPRequest = {
            email: email,
        }
        const response = await axios.post(`${api_url}/auth/sendOTP`, sendOTPRequest);
        console.log(response.data);
        return response.data;
    } catch(error: any) {
        alert(error.response.data.message);
        return null;
    }  
}

export const resetPassword = async (email: string, password: string, 
    passwordConfirm: string, otp: string) : Promise<ApiResponse<any> | null> => {
    try {
        const resetPasswordRequest: ResetPasswordRequest = {
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            otp: otp
        } 
        const response = await axios.post(`${api_url}/auth/reset-password`, resetPasswordRequest);
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        alert(error.response.data.message);
        return null;
    }
}

export const login = async (email: string, password: string): 
                    Promise<ApiResponse<LoginResponse> | null> => {
    try {
        const loginRequest: LoginRequest = {
            email: email,
            password: password
        }
        const response = await axios.post(`${api_url}/auth/login`, loginRequest);
        return response.data;
    } catch (error: any) {
        alert(error.response.data.message);
        return null;
    }
}

export const editUser = async (name: string, avatar: string) : Promise<ApiResponse<any> | null> => {
    try {
        const updateUserRequest: UpdateUserRequest = {
            name: name,
            avatar: avatar
        }
        
        const response = await axios.put(`${api_url}/users`, updateUserRequest);
        return response.data;
    } catch (error: any) {
        console.log(error.response.data);
        alert(error.response.data.message);
        return null;
    }
}