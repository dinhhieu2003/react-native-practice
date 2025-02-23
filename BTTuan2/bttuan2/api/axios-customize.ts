import axiosClient from "axios";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";

/**
 * Creates an initial 'axios' instance with custom settings.
 */


const instance = axiosClient.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
    withCredentials: true
});

instance.interceptors.request.use(function (config) {
    if (SecureStore.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + SecureStore.getItem('access_token');
    }
    if (!config.headers.Accept && config.headers["Content-Type"]) {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json; charset=utf-8";
    }
    return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.status === 401) {
            console.log("401");
            await SecureStore.deleteItemAsync("access_token");
            return;
        }
        throw error;
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;