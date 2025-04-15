import { ElementType, ApiResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest, SendOTPRequest, UpdateUserRequest, VerifyOTPRequest, VerifyOTPResponse, Podcast, PodcastsApiResponseData, CommentsApiResponseData, Comment, 
    ElementComment, ElementCommentsApiResponseData, PodcastDetail,
    NotificationApiResponseData, NotificationItem,
    UserProfile, PaginatedResponse, FavoriteElement, FavoritePodcast, ViewedElement, ViewedPodcast
} from "@/utils/types/type";
import axios from "./axios-customize";
import * as SecureStore from 'expo-secure-store';

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

export const verifyOTPRegister = async (email: string, otp: string):
                        Promise<ApiResponse<VerifyOTPResponse> | null> => {
    try {
        const verifyOTPRequest: VerifyOTPRequest = {
            email: email,
            otp: otp
        }
        const response = await axios.post(`${api_url}/auth/verify-register`, verifyOTPRequest);
        console.log(response.data);
        return response.data;
    } catch(error: any) {
        alert(error.response.data.message);
        return null;
    }  
}

export const verifyOTPChangeEmail = async (email: string, otp: string):
                        Promise<ApiResponse<VerifyOTPResponse> | null> => {
    try {
        const verifyOTPRequest: VerifyOTPRequest = {
            email: email,
            otp: otp
        }
        const response = await axios.post(`${api_url}/auth/verify-change-email`, verifyOTPRequest);
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

        { symbol: "Hf", name: "Hafnium", atomic_number: 72, group: 4, period: 6, block: "d", type: "Group 4" },
        { symbol: "Ta", name: "Tantalum", atomic_number: 73, group: 5, period: 6, block: "d", type: "Group 5" },
        { symbol: "W", name: "Tungsten", atomic_number: 74, group: 6, period: 6, block: "d", type: "Group 6" },
        { symbol: "Re", name: "Rhenium", atomic_number: 75, group: 7, period: 6, block: "d", type: "Group 7" },
        { symbol: "Os", name: "Osmium", atomic_number: 76, group: 8, period: 6, block: "d", type: "Group 8" },
        { symbol: "Ir", name: "Iridium", atomic_number: 77, group: 9, period: 6, block: "d", type: "Group 9" },
        { symbol: "Pt", name: "Platinum", atomic_number: 78, group: 10, period: 6, block: "d", type: "Group 10" },
        { symbol: "Au", name: "Gold", atomic_number: 79, group: 11, period: 6, block: "d", type: "Group 11" },
        { symbol: "Hg", name: "Mercury", atomic_number: 80, group: 12, period: 6, block: "d", type: "Group 12" },
        { symbol: "Tl", name: "Thallium", atomic_number: 81, group: 13, period: 6, block: "p", type: "Group 13" },
        { symbol: "Pb", name: "Lead", atomic_number: 82, group: 14, period: 6, block: "p", type: "Group 14" },
        { symbol: "Bi", name: "Bismuth", atomic_number: 83, group: 15, period: 6, block: "p", type: "Group 15" },
        { symbol: "Po", name: "Polonium", atomic_number: 84, group: 16, period: 6, block: "p", type: "Group 16" },
        { symbol: "At", name: "Astatine", atomic_number: 85, group: 17, period: 6, block: "p", type: "Group 17" },
        { symbol: "Rn", name: "Radon", atomic_number: 86, group: 18, period: 6, block: "p", type: "Group 18" },
        { symbol: "Fr", name: "Francium", atomic_number: 87, group: 1, period: 7, block: "s", type: "Group 1" },
        { symbol: "Ra", name: "Radium", atomic_number: 88, group: 2, period: 7, block: "s", type: "Group 2" },
        { symbol: "Ac", name: "Actinium", atomic_number: 89, group: 3, period: 7, block: "f", type: "Actinide" },

        { symbol: "Rf", name: "Rutherfordium", atomic_number: 104, group: 4, period: 7, block: "d", type: "Group 4" },
        { symbol: "Db", name: "Dubnium", atomic_number: 105, group: 5, period: 7, block: "d", type: "Group 5" },
        { symbol: "Sg", name: "Seaborgium", atomic_number: 106, group: 6, period: 7, block: "d", type: "Group 6" },
        { symbol: "Bh", name: "Bohrium", atomic_number: 107, group: 7, period: 7, block: "d", type: "Group 7" },
        { symbol: "Hs", name: "Hassium", atomic_number: 108, group: 8, period: 7, block: "d", type: "Group 8" },
        { symbol: "Mt", name: "Meitnerium", atomic_number: 109, group: 9, period: 7, block: "d", type: "Group 9" },
        { symbol: "Ds", name: "Darmstadtium", atomic_number: 110, group: 10, period: 7, block: "d", type: "Group 10" },
        { symbol: "Rg", name: "Roentgenium", atomic_number: 111, group: 11, period: 7, block: "d", type: "Group 11" },
        { symbol: "Cn", name: "Copernicium", atomic_number: 112, group: 12, period: 7, block: "d", type: "Group 12" },
        { symbol: "Nh", name: "Nihonium", atomic_number: 113, group: 13, period: 7, block: "p", type: "Group 13" },
        { symbol: "Fl", name: "Flerovium", atomic_number: 114, group: 14, period: 7, block: "p", type: "Group 14" },
        { symbol: "Mc", name: "Moscovium", atomic_number: 115, group: 15, period: 7, block: "p", type: "Group 15" },
        { symbol: "Lv", name: "Livermorium", atomic_number: 116, group: 16, period: 7, block: "p", type: "Group 16" },
        { symbol: "Ts", name: "Tennessine", atomic_number: 117, group: 17, period: 7, block: "p", type: "Group 17" },
        { symbol: "Og", name: "Oganesson", atomic_number: 118, group: 18, period: 7, block: "p", type: "Group 18" },

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

// ============ Podcasts API =====================

export const fetchPodcastsByElement = async (elementName: string): Promise<Podcast[]> => {
  // Use axios instance if available and configured, otherwise fallback to fetch
  // Assuming axios is configured for base URL and potential interceptors
  // const url = `/podcasts?term=${encodeURIComponent(elementName)}`;
  // For consistency with the request, using fetch directly here as specified in the prompt example
  // Note: The base URL from env should likely point to the root API, e.g., http://yourdomain.com
  // The endpoint path is then appended.
  const url = `${base_url}/api/v1/podcasts?term=${elementName}`;

  try {
    // Using fetch as per the initial code snippet provided
    const response = await axios.get(url);
    // Assuming the standard ApiResponse structure defined in types
    const data: ApiResponse<PodcastsApiResponseData> = await response.data;

    if (data.error) {
      console.error('API returned an error:', data.error);
      throw new Error(data.message || `API error fetching podcasts for ${elementName}`);
    }

    // Return only the results array
    return data.data.result || [];
  } catch (error) {
    console.error(`Error fetching podcasts for ${elementName}:`, error);
    // Optionally, show a user-friendly message here via alert or a state update
    alert(`Failed to load podcasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return []; // Return empty array on error to allow UI to display 'no results' or error state
  }
};

// ============ Favorite Podcasts API =====================

/**
 * Fetches the favorite status of a specific podcast.
 */
export const getFavoriteStatus = async (podcastId: string):
  Promise<ApiResponse<{ podcastId: number; active: boolean }>> => {
  const url = `${api_url}/favorite-podcasts/podcasts/${podcastId}`;
  console.log(`GET Request URL: ${url}`);
  try {
    const response = await axios.get(url);
    return response.data; // Axios automatically handles JSON parsing and throws for bad statuses
  } catch (error: any) {
    console.error(`Error fetching favorite status for podcast ${podcastId}:`, error.response?.data || error.message);
    // Rethrow or return a structured error object based on preferred handling
    // Example: Re-throwing to let the calling component handle it
    throw new Error(error.response?.data?.message || `Failed to fetch favorite status for podcast ${podcastId}`);
  }
};

/**
 * Toggles the favorite status of a specific podcast.
 */
export const toggleFavoriteStatus = async (podcastId: string):
  Promise<ApiResponse<{ podcastId: number; active: boolean }>> => {
  const url = `${api_url}/favorite-podcasts/podcasts/${podcastId}`;
  console.log(`POST Request URL: ${url}`);
  try {
    const response = await axios.post(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error toggling favorite status for podcast ${podcastId}:`, error.response?.data || error.message);
    // Example: Re-throwing
    throw new Error(error.response?.data?.message || `Failed to toggle favorite status for podcast ${podcastId}`);
  }
};

// ============ Podcast Comments API =====================



/**
 * Fetches comments for a specific podcast with pagination.
 */
export const getPodcastComments = async (podcastId: number, page: number = 1, pageSize: number = 10):
  Promise<ApiResponse<CommentsApiResponseData>> => {
    console.log(`podcastId: ${podcastId}`);
  const url = `${api_url}/comments/podcasts?page=${page}&pageSize=${pageSize}&podcastId=${podcastId}`;
  console.log(`GET Request URL (Comments): ${url}`);
  try {
    const response = await axios.get(url);
    // Ensure the response structure matches ApiResponse<CommentsApiResponseData>
    // If the API directly returns the structure { result: [], meta: {} }, wrap it if needed
    // Assuming response.data directly matches the expected structure
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching comments for podcast ${podcastId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch comments for podcast ${podcastId}`);
  }
};

/**
 * Adds a new comment to a podcast.
 */
export const addPodcastComment = async (content: string, podcastId: number):
  Promise<ApiResponse<Comment>> => { // Assuming the API returns the newly created comment
  const url = `${api_url}/comments/podcasts`;
  console.log(`POST Request URL (Add Comment): ${url}`);
  const body = { content, podcastId };
  try {
    const response = await axios.post(url, body);
    return response.data;
  } catch (error: any) {
    console.error(`Error adding comment to podcast ${podcastId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to add comment.`);
  }
};

/**
 * Edits an existing comment.
 */
export const editPodcastComment = async (commentId: number, content: string):
  Promise<ApiResponse<Comment>> => { // Assuming the API returns the updated comment
  const url = `${api_url}/comments/podcasts/${commentId}`;
  console.log(`PUT Request URL (Edit Comment): ${url}`);
  const body = { content };
  try {
    const response = await axios.put(url, body);
    return response.data;
  } catch (error: any) {
    console.error(`Error editing comment ${commentId}:`, error.response?.data || error.message);
    // Specific check for 403 Forbidden
    if (error.response?.status === 403) {
        throw new Error(error.response?.data?.message || 'You do not have permission to edit this comment.');
    }
    throw new Error(error.response?.data?.message || `Failed to edit comment.`);
  }
};

/**
 * Likes a podcast comment.
 */
export const likePodcastComment = async (commentId: number):
  Promise<ApiResponse<{ message: string }>> => { // Assuming a simple success message response
  const url = `${api_url}/comments/podcasts/${commentId}/like`;
  console.log(`PATCH Request URL (Like Comment): ${url}`);
  try {
    // Using PATCH as specified, assuming no request body is needed
    const response = await axios.patch(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error liking comment ${commentId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to like comment.`);
  }
};

// ============ Favorite Elements API =====================

/**
 * Fetches the favorite status of a specific element.
 */
export const getElementFavoriteStatus = async (elementId: number):
  Promise<ApiResponse<{ elementId: number; active: boolean }>> => {
  const url = `${api_url}/favorite-elements/elements/${elementId}`;
  console.log(`GET Request URL: ${url}`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching favorite status for element ${elementId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch favorite status for element ${elementId}`);
  }
};

/**
 * Toggles the favorite status of a specific element.
 */
export const toggleElementFavorite = async (elementId: number):
  Promise<ApiResponse<{ elementId: number; active: boolean }>> => {
  const url = `${api_url}/favorite-elements/elements/${elementId}`;
  console.log(`POST Request URL: ${url}`);
  try {
    const response = await axios.post(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error toggling favorite status for element ${elementId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to toggle favorite status for element ${elementId}`);
  }
};


// ============ Element Comments API =====================

/**
 * Fetches comments for a specific element with pagination.
 */
export const getElementComments = async (elementId: number, page: number = 1, pageSize: number = 10):
  Promise<ApiResponse<ElementCommentsApiResponseData>> => {
  const url = `${api_url}/comments/elements?current=${page}&pageSize=${pageSize}&elementId=${elementId}`;
  console.log(`GET Request URL (Element Comments): ${url}`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching comments for element ${elementId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to fetch comments for element ${elementId}`);
  }
};

/**
 * Adds a new comment to an element.
 */
export const addElementComment = async (content: string, elementId: number):
  Promise<ApiResponse<ElementComment>> => {
  const url = `${api_url}/comments/elements`;
  console.log(`POST Request URL (Add Element Comment): ${url}`);
  const body = { content, elementId };
  try {
    const response = await axios.post(url, body);
    return response.data;
  } catch (error: any) {
    console.error(`Error adding comment to element ${elementId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to add comment.`);
  }
};

/**
 * Edits an existing element comment.
 */
export const editElementComment = async (commentId: number, content: string):
  Promise<ApiResponse<ElementComment>> => {
  const url = `${api_url}/comments/elements/${commentId}`;
  console.log(`PUT Request URL (Edit Element Comment): ${url}`);
  const body = { content };
  try {
    const response = await axios.put(url, body);
    return response.data;
  } catch (error: any) {
    console.error(`Error editing element comment ${commentId}:`, error.response?.data || error.message);
    if (error.response?.status === 403) {
        throw new Error(error.response?.data?.message || 'You do not have permission to edit this comment.');
    }
    throw new Error(error.response?.data?.message || `Failed to edit comment.`);
  }
};

/**
 * Likes an element comment.
 */
export const likeElementComment = async (commentId: number):
  Promise<ApiResponse<{ message: string }>> => {
  const url = `${api_url}/comments/elements/${commentId}/like`;
  console.log(`PATCH Request URL (Like Element Comment): ${url}`);
  try {
    const response = await axios.patch(url);
    return response.data;
  } catch (error: any) {
    console.error(`Error liking element comment ${commentId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to like comment.`);
  }
};

// ============ Viewed Elements API =====================

/**
 * Records that an element has been viewed by the user.
 */
export const recordElementView = async (elementId: number):
  Promise<ApiResponse<any> | null> => {
  // No request body is typically needed for this type of action, just the ID in the URL.
  const url = `${api_url}/viewed-elements/element/${elementId}`;
  console.log(`POST Request URL (Record Element View): ${url}`);

  try {
    // Use POST method as specified
    const response = await axios.post(url);
    // Return the response data, which might contain a success message or be empty
    return response.data;
  } catch (error: any) {
    // Log the error for debugging, but don't block user flow or show alert
    console.error(`Error recording view for element ${elementId}:`, error.response?.data || error.message);
    // Return null or a specific error structure if the caller needs to know about the failure
    // For a background task like this, returning null is often sufficient.
    return null;
  }
};

// ============ Viewed Podcasts API =====================

/**
 * Records that a podcast has been viewed by the user.
 */
export const recordPodcastView = async (podcastId: number | string):
  Promise<ApiResponse<any> | null> => {
  // No request body is typically needed for this type of action, just the ID in the URL.
  const url = `${api_url}/viewed-podcasts/podcasts/${podcastId}`;
  console.log(`POST Request URL (Record Podcast View): ${url}`);

  try {
    // Use POST method as specified
    const response = await axios.post(url);
    // Return the response data, which might contain a success message or be empty
    return response.data;
  } catch (error: any) {
    // Log the error for debugging, but don't block user flow or show alert
    console.error(`Error recording view for podcast ${podcastId}:`, error.response?.data || error.message);
    // Return null or a specific error structure if the caller needs to know about the failure
    // For a background task like this, returning null is often sufficient.
    return null;
  }
};

export const getUserProfile = async (): Promise<ApiResponse<UserProfile> | null> => {
    try {
        const response = await axios.get<ApiResponse<UserProfile>>(`${api_url}/users/profile`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch profile");
        return null;
    }
}

export const getPodcastById = async (podcastId: number): Promise<ApiResponse<PodcastDetail> | null> => {
    try {
        const response = await axios.get<ApiResponse<PodcastDetail>>(`${api_url}/podcasts/${podcastId}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching podcast ${podcastId}:`, error.response?.data || error.message);
        // Avoid redundant alert if console log is sufficient
        // alert(error.response?.data?.message || `Failed to fetch podcast details for ID ${podcastId}`);
        return null;
    }
}

export const getFavoriteElements = async (current: number = 1, pageSize: number = 10): 
    Promise<ApiResponse<PaginatedResponse<FavoriteElement>> | null> => {
    try {
        const response = await axios.get<ApiResponse<PaginatedResponse<FavoriteElement>>>(`${api_url}/favorite-elements`, {
            params: { current, pageSize }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching favorite elements:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch favorite elements");
        return null;
    }
}

export const getFavoritePodcasts = async (current: number = 1, pageSize: number = 10):
    Promise<ApiResponse<PaginatedResponse<FavoritePodcast>> | null> => {
    try {
        const response = await axios.get<ApiResponse<PaginatedResponse<FavoritePodcast>>>(`${api_url}/favorite-podcasts`, {
            params: { current, pageSize }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching favorite podcasts:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch favorite podcasts");
        return null;
    }
}

export const getViewedElements = async (current: number = 1, pageSize: number = 10):
    Promise<ApiResponse<PaginatedResponse<ViewedElement>> | null> => {
    try {
        const response = await axios.get<ApiResponse<PaginatedResponse<ViewedElement>>>(`${api_url}/viewed-elements`, {
            params: { current, pageSize }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching viewed elements:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch viewed elements");
        return null;
    }
}

export const getViewedPodcasts = async (current: number = 1, pageSize: number = 10):
    Promise<ApiResponse<PaginatedResponse<ViewedPodcast>> | null> => {
    try {
        const response = await axios.get<ApiResponse<PaginatedResponse<ViewedPodcast>>>(`${api_url}/viewed-podcasts`, {
            params: { current, pageSize }
        });
        return response.data;
    } catch (error: any) {
        console.error("Error fetching viewed podcasts:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch viewed podcasts");
        return null;
    }
}

// ============ Notifications ===================

// Fetch notifications with pagination
export const WorkspaceNotifications = async (
    current: number = 1, 
    pageSize: number = 20
): Promise<ApiResponse<NotificationApiResponseData> | null> => {
    const url = `${api_url}/notifications?current=${current}&pageSize=${pageSize}`;
    console.log('Fetching notifications:', url);
    try {
        const response = await axios.get<ApiResponse<NotificationApiResponseData>>(url);
        console.log('Notifications fetched:', JSON.stringify(response.data.data.result, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('Error fetching notifications:', url, error.response?.data || error.message);
        // Re-throw or handle as per existing error handling strategy
        // For now, returning null similar to other functions
        alert(error.response?.data?.message || 'Failed to fetch notifications');
        return null;
    }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<ApiResponse<any> | null> => {
    const url = `${api_url}/notifications/${notificationId}/read`;
    console.log('Marking notification as read:', url);
    try {
        const response = await axios.patch<ApiResponse<any>>(url);
        return response.data;
    } catch (error: any) {
        console.error('Error marking notification as read:', url, error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to mark notification as read');
        return null;
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<any> | null> => {
    const url = `${api_url}/notifications/read-all`;
    console.log('Marking all notifications as read:', url);
    try {
        const response = await axios.patch<ApiResponse<any>>(url);
        return response.data;
    } catch (error: any) {
        console.error('Error marking all notifications as read:', url, error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to mark all notifications as read');
        return null;
    }
};

// Delete a specific notification (Optional)
export const deleteNotification = async (notificationId: number): Promise<ApiResponse<any> | null> => {
    const url = `${api_url}/notifications/${notificationId}`;
    console.log('Deleting notification:', url);
    try {
        const response = await axios.delete<ApiResponse<any>>(url);
        return response.data;
    } catch (error: any) {
        console.error('Error deleting notification:', url, error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to delete notification');
        return null;
    }
};