import { Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import * as scrollStyles from "../../styles/scroll";
import { Link, useRouter } from "expo-router";
import * as api from "../../api/api";
import { ApiResponse, LoginResponse } from "@/utils/types/type";
import * as SecureStore from 'expo-secure-store';
import WebSocketService from "@/services/WebSocketService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const handleLogin = async() => {
        const response: ApiResponse<LoginResponse> | null = await api.login(email, password);
        const loginResponse: LoginResponse | undefined = response?.data;
        
        if(response !== null && loginResponse !== undefined) {
            console.log("Login successful, storing tokens...");
            await SecureStore.setItemAsync("accessToken", loginResponse.accessToken);
            await SecureStore.setItemAsync("id", loginResponse.id.toString());
            await SecureStore.setItemAsync("email", loginResponse.email);
            await SecureStore.setItemAsync("name", loginResponse.name);
            await SecureStore.setItemAsync("avatar", loginResponse.avatar || "");
            await SecureStore.setItemAsync("role", loginResponse.role);
            console.log("Tokens stored.");
        }
        
        if(response !== null) {
            try {
                console.log("Attempting to connect WebSocket (response was not null)...");
                await WebSocketService.connect();
                console.log("WebSocket connect initiated.");

                router.replace("/(home)");
            } catch (error) {
                console.error("Error connecting WebSocket or navigating:", error);
                alert("An error occurred after login attempt.");
            }
        }
    }
    
    return (
        <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
            <View style={imgStyles.styles.container}>
                <Image
                    style={imgStyles.styles.squareImg}
                    source={require("../../assets/images/login.png")}
                />
            </View>

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Email" 
                keyboardType="email-address" 
                value={email} 
                onChangeText={setEmail} 
            />

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Mật khẩu" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
            />

            <View style={formStyles.styles.container}>
                <Link 
                    href={"/(auth)/forgot"}
                    replace
                    style={{color:"blue", alignSelf: "flex-end"}}>
                    Quên mật khẩu?
                </Link>
            </View>
            
            <TouchableOpacity style={formStyles.styles.button} onPress={handleLogin}>
                <Text style={formStyles.styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={{flexDirection: "row", margin: "auto", marginTop: 15, marginBottom: 15}}>
                <Text>Chưa có tài khoản? </Text>
                <Link 
                    href={"/(auth)/register"}
                    replace
                    style={{color: "blue"}}>
                    Đăng ký ngay
                </Link>
            </View>
        </ScrollView>
    );
}