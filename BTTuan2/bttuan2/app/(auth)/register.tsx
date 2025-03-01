import { Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import * as scrollStyles from "../../styles/scroll";
import { Link, useRouter } from "expo-router";
import * as api from "../../api/api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    
    const handleRegister = async() => {
        if(password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp");
            return;
        }
        // send register information to api register
        const registerResponse:any = await api.register(name, email, password);
        console.log(registerResponse.data);
        router.replace(
            {
                pathname: "/(auth)/verify-register",
                params: { email },
            }
        );
    }

    return (
        // form register
        <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
            <View style={imgStyles.styles.container}>
                <Image
                    style={imgStyles.styles.squareImg}
                    source={require("../../assets/images/auth.png")}
                />
            </View>
                

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Tên của bạn" 
                value={name} 
                onChangeText={setName} 
            />

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

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Nhập lại mật khẩu" 
                secureTextEntry 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
            />

            <TouchableOpacity style={formStyles.styles.button} onPress={handleRegister}>
                <Text style={formStyles.styles.buttonText}>Đăng ký ngay</Text>
            </TouchableOpacity>
            
            <View style={{flexDirection: "row", margin: "auto", marginTop: 15, marginBottom: 15}}>
                <Text>Đã có tài khoản? </Text>
                <Link 
                    href={"/(auth)/login"}
                    replace
                    style={{color: "blue"}}>
                    Đăng nhập ngay
                </Link>
            </View>

            <Link href={"/(auth)/verify"} replace>OTP</Link>
            
        </ScrollView>
    );
}