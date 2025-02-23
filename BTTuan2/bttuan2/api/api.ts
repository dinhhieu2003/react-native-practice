import { ElementType, ApiResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, SendOTPRequest, UpdateUserRequest, VerifyOTPRequest, VerifyOTPResponse } from "@/utils/types/type";
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
        console.log(`${api_url}/auth/login`);
        const response = await axios.post(`${api_url}/auth/login`, loginRequest);
        console.log(response.data);
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

// ============================================================== //
export const getElements = (): ElementType[] => {
    const elements: ElementType[] = [
        { symbol: "H", name: "Hydrogen", atomic_number: 1, group: 1, period: 1, block: "s", type: "Hidro" },
        { symbol: "He", name: "Helium", atomic_number: 2, group: 18, period: 1, block: "s", type: "Group 18" },
        { symbol: "Li", name: "Lithium", atomic_number: 3, group: 1, period: 2, block: "s", type: "Group 1" },
        { symbol: "Be", name: "Beryllium", atomic_number: 4, group: 2, period: 2, block: "s", type: "Group 2" },
        { symbol: "B", name: "Boron", atomic_number: 5, group: 13, period: 2, block: "p", type: "Group 13" },
        { symbol: "C", name: "Carbon", atomic_number: 6, group: 14, period: 2, block: "p", type: "Group 14" },
        { symbol: "N", name: "Nitrogen", atomic_number: 7, group: 15, period: 2, block: "p", type: "Group 15" },
        { symbol: "O", name: "Oxygen", atomic_number: 8, group: 16, period: 2, block: "p", type: "Group 16" },
        { symbol: "F", name: "Fluorine", atomic_number: 9, group: 17, period: 2, block: "p", type: "Group 17" },
        { symbol: "Ne", name: "Neon", atomic_number: 10, group: 18, period: 2, block: "p", type: "Group 18" },
        { symbol: "Na", name: "Sodium", atomic_number: 11, group: 1, period: 3, block: "s", type: "Group 1" },
        { symbol: "Mg", name: "Magnesium", atomic_number: 12, group: 2, period: 3, block: "s", type: "Group 2" },
        { symbol: "Al", name: "Aluminum", atomic_number: 13, group: 13, period: 3, block: "p", type: "Group 13" },
        { symbol: "Si", name: "Silicon", atomic_number: 14, group: 14, period: 3, block: "p", type: "Group 14" },
        { symbol: "P", name: "Phosphorus", atomic_number: 15, group: 15, period: 3, block: "p", type: "Group 15" },
        { symbol: "S", name: "Sulfur", atomic_number: 16, group: 16, period: 3, block: "p", type: "Group 16" },
        { symbol: "Cl", name: "Chlorine", atomic_number: 17, group: 17, period: 3, block: "p", type: "Group 17" },
        { symbol: "Ar", name: "Argon", atomic_number: 18, group: 18, period: 3, block: "p", type: "Group 18" },
        
        // ... (Tất cả các nguyên tố khác từ 19 đến 57)
        { symbol: "K", name: "Potassium", atomic_number: 19, group: 1, period: 4, block: "s", type: "Group 1" },
        { symbol: "Ca", name: "Calcium", atomic_number: 20, group: 2, period: 4, block: "s", type: "Group 2" },
        { symbol: "Sc", name: "Scandium", atomic_number: 21, group: 3, period: 4, block: "d", type: "Group 3" },
        { symbol: "Ti", name: "Titanium", atomic_number: 22, group: 4, period: 4, block: "d", type: "Group 4" },
        { symbol: "V", name: "Vanadium", atomic_number: 23, group: 5, period: 4, block: "d", type: "Group 5" },
        { symbol: "Cr", name: "Chromium", atomic_number: 24, group: 6, period: 4, block: "d", type: "Group 6" },
        { symbol: "Mn", name: "Manganese", atomic_number: 25, group: 7, period: 4, block: "d", type: "Group 7" },
        { symbol: "Fe", name: "Iron", atomic_number: 26, group: 8, period: 4, block: "d", type: "Group 8" },
        { symbol: "Co", name: "Cobalt", atomic_number: 27, group: 9, period: 4, block: "d", type: "Group 9" },
        { symbol: "Ni", name: "Nickel", atomic_number: 28, group: 10, period: 4, block: "d", type: "Group 10" },
        { symbol: "Cu", name: "Copper", atomic_number: 29, group: 11, period: 4, block: "d", type: "Group 11" },
        { symbol: "Zn", name: "Zinc", atomic_number: 30, group: 12, period: 4, block: "d", type: "Group 12" },
        { symbol: "Ga", name: "Gallium", atomic_number: 31, group: 13, period: 4, block: "p", type: "Group 13" },
        { symbol: "Ge", name: "Germanium", atomic_number: 32, group: 14, period: 4, block: "p", type: "Group 14" },
        { symbol: "As", name: "Arsenic", atomic_number: 33, group: 15, period: 4, block: "p", type: "Group 15" },
        { symbol: "Se", name: "Selenium", atomic_number: 34, group: 16, period: 4, block: "p", type: "Group 16" },
        { symbol: "Br", name: "Bromine", atomic_number: 35, group: 17, period: 4, block: "p", type: "Group 17" },
        { symbol: "Kr", name: "Krypton", atomic_number: 36, group: 18, period: 4, block: "p", type: "Group 18" },
        { symbol: "Rb", name: "Rubidium", atomic_number: 37, group: 1, period: 5, block: "s", type: "Group 1" },
        { symbol: "Sr", name: "Strontium", atomic_number: 38, group: 2, period: 5, block: "s", type: "Group 2" },
        { symbol: "Y", name: "Yttrium", atomic_number: 39, group: 3, period: 5, block: "d", type: "Group 3" },
        { symbol: "Zr", name: "Zirconium", atomic_number: 40, group: 4, period: 5, block: "d", type: "Group 4" },
        { symbol: "Nb", name: "Niobium", atomic_number: 41, group: 5, period: 5, block: "d", type: "Group 5" },
        { symbol: "Mo", name: "Molybdenum", atomic_number: 42, group: 6, period: 5, block: "d", type: "Group 6" },
        { symbol: "Tc", name: "Technetium", atomic_number: 43, group: 7, period: 5, block: "d", type: "Group 7" },
        { symbol: "Ru", name: "Ruthenium", atomic_number: 44, group: 8, period: 5, block: "d", type: "Group 8" },
        { symbol: "Rh", name: "Rhodium", atomic_number: 45, group: 9, period: 5, block: "d", type: "Group 9" },
        { symbol: "Pd", name: "Palladium", atomic_number: 46, group: 10, period: 5, block: "d", type: "Group 10" },
        { symbol: "Ag", name: "Silver", atomic_number: 47, group: 11, period: 5, block: "d", type: "Group 11" },
        { symbol: "Cd", name: "Cadmium", atomic_number: 48, group: 12, period: 5, block: "d", type: "Group 12" },
        { symbol: "In", name: "Indium", atomic_number: 49, group: 13, period: 5, block: "p", type: "Group 13" },
        { symbol: "Sn", name: "Tin", atomic_number: 50, group: 14, period: 5, block: "p", type: "Group 14" },
        { symbol: "Sb", name: "Antimony", atomic_number: 51, group: 15, period: 5, block: "p", type: "Group 15" },
        { symbol: "Te", name: "Tellurium", atomic_number: 52, group: 16, period: 5, block: "p", type: "Group 16" },
        { symbol: "I", name: "Iodine", atomic_number: 53, group: 17, period: 5, block: "p", type: "Group 17" },
        { symbol: "Xe", name: "Xenon", atomic_number: 54, group: 18, period: 5, block: "p", type: "Group 18" },
        { symbol: "Cs", name: "Cesium", atomic_number: 55, group: 1, period: 6, block: "s", type: "Group 1" },
        { symbol: "Ba", name: "Barium", atomic_number: 56, group: 2, period: 6, block: "s", type: "Group 2" },
        { symbol: "La", name: "Lanthanum", atomic_number: 57, group: 3, period: 6, block: "d", type: "Lanthanide" },
        
        // Lanthanides (Period 8)
        { symbol: "Ce", name: "Cerium", atomic_number: 58, group: 3, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Pr", name: "Praseodymium", atomic_number: 59, group: 4, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Nd", name: "Neodymium", atomic_number: 60, group: 5, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Pm", name: "Promethium", atomic_number: 61, group: 6, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Sm", name: "Samarium", atomic_number: 62, group: 7, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Eu", name: "Europium", atomic_number: 63, group: 8, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Gd", name: "Gadolinium", atomic_number: 64, group: 9, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Tb", name: "Terbium", atomic_number: 65, group: 10, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Dy", name: "Dysprosium", atomic_number: 66, group: 11, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Ho", name: "Holmium", atomic_number: 67, group: 12, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Er", name: "Erbium", atomic_number: 68, group: 13, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Tm", name: "Thulium", atomic_number: 69, group: 14, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Yb", name: "Ytterbium", atomic_number: 70, group: 15, period: 8, block: "f", type: "Lanthanide" },
        { symbol: "Lu", name: "Lutetium", atomic_number: 71, group: 16, period: 8, block: "d", type: "Lanthanide" },

        // Actinides (Period 9)
        { symbol: "Th", name: "Thorium", atomic_number: 90, group: 3, period: 9, block: "f", type: "Actinide" },
        { symbol: "Pa", name: "Protactinium", atomic_number: 91, group: 4, period: 9, block: "f", type: "Actinide" },
        { symbol: "U", name: "Uranium", atomic_number: 92, group: 5, period: 9, block: "f", type: "Actinide" },
        { symbol: "Np", name: "Neptunium", atomic_number: 93, group: 6, period: 9, block: "f", type: "Actinide" },
        { symbol: "Pu", name: "Plutonium", atomic_number: 94, group: 7, period: 9, block: "f", type: "Actinide" },
        { symbol: "Am", name: "Americium", atomic_number: 95, group: 8, period: 9, block: "f", type: "Actinide" },
        { symbol: "Cm", name: "Curium", atomic_number: 96, group: 9, period: 9, block: "f", type: "Actinide" },
        { symbol: "Bk", name: "Berkelium", atomic_number: 97, group: 10, period: 9, block: "f", type: "Actinide" },
        { symbol: "Cf", name: "Californium", atomic_number: 98, group: 11, period: 9, block: "f", type: "Actinide" },
        { symbol: "Es", name: "Einsteinium", atomic_number: 99, group: 12, period: 9, block: "f", type: "Actinide" },
        { symbol: "Fm", name: "Fermium", atomic_number: 100, group: 13, period: 9, block: "f", type: "Actinide" },
        { symbol: "Md", name: "Mendelevium", atomic_number: 101, group: 14, period: 9, block: "f", type: "Actinide" },
        { symbol: "No", name: "Nobelium", atomic_number: 102, group: 15, period: 9, block: "f", type: "Actinide" },
        { symbol: "Lr", name: "Lawrencium", atomic_number: 103, group: 16, period: 9, block: "d", type: "Actinide" },

    ];
    return elements;
}