import { Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import * as scrollStyles from "../../styles/scroll";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import OTPInput from "@/components/otpInput";
import * as api from "../../api/api";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const { email, otpValue } = useLocalSearchParams();
    const emailString = email as string;
    const otpValueString = otpValue as string;
    
    const router = useRouter();

    const handleResetPassword = () => {
        const response = api.resetPassword(emailString, password, confirmPassword, otpValueString);
        if(response !== null) {
            router.replace("/(auth)/login");
        }
    }
    
    return (
        // form register
        <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
            <View style={imgStyles.styles.container}>
                <Image
                    style={imgStyles.styles.squareImg}
                    source={require("../../assets/images/forgot_password.png")}
                />
            </View>

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Mật khẩu mới" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
            />

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Nhập lại mật khẩu mới" 
                secureTextEntry 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
            />

            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]}
                                onPress={handleResetPassword}>
                <Text style={formStyles.styles.buttonText}>Đặt lại mật khẩu</Text>
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