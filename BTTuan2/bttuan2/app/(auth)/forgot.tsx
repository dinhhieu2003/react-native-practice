import { Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import * as scrollStyles from "../../styles/scroll";
import { Link, useRouter } from "expo-router";
import OTPInput from "@/components/otpInput";
import * as api from "../../api/api";

export default function Forgot() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpValue, setOtpValue] = useState("");
    
    const router = useRouter();

    const handleOTPComplete = (otp: string) => {
        setOtpValue(otp);
        console.log(otp);
    }

    const handleSendOTP = () => {
        const response = api.resendOTP(email);
        console.log(response);
    }

    const handleConfirmOTP = async() => {
        const response: any = await api.verifyOTP(email, otpValue);
        alert("Xác nhận thành công");
        router.replace(
            {
                pathname: "/(auth)/reset-password",
                params: { email, otpValue },
            }
        );
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
                placeholder="Email" 
                keyboardType="email-address" 
                value={email} 
                onChangeText={setEmail} 
            />


            <TouchableOpacity style={formStyles.styles.button}
                                onPress={handleSendOTP}>
                <Text style={formStyles.styles.buttonText}>Gửi mã xác nhận</Text>
            </TouchableOpacity>

            <OTPInput length={6} onOtpComplete={handleOTPComplete}/>

            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]} onPress={handleConfirmOTP}>
                <Text style={formStyles.styles.buttonText}>Xác nhận</Text>
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