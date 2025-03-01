import { Text, Image, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import * as scrollStyles from "../../styles/scroll";
import { Link, useRouter } from "expo-router";
import OTPInput from "@/components/otpInput";
import * as api from "../../api/api";

export default function EditEmail() {
    const [email, setEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");
    
    const router = useRouter();

    const handleOTPComplete = (otp: string) => {
        setOtpValue(otp);
        console.log(otp);
    }

    const handleSendOTP = async () => {
        const response = await api.resendOTP(email);
        if(response !== null)
            alert("OTP vừa được gửi tới email: " + email);
        console.log(response);
    }

    const handleConfirmOTP = async() => {
        const response: any = await api.verifyOTPChangeEmail(email, otpValue);
        console.log(response);
        if(response !== null) {
            alert("Xác nhận thành công");
            router.back();
        }
  
    }
    
    return (
        // form register
        <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>

            <TextInput 
                style={formStyles.styles.input} 
                placeholder="Nhập email mới" 
                keyboardType="email-address" 
                value={email} 
                onChangeText={setEmail} 
            />

            <TouchableOpacity style={formStyles.styles.button}
                                onPress={handleSendOTP}>
                <Text style={formStyles.styles.buttonText}>Gửi mã xác nhận</Text>
            </TouchableOpacity>

            <OTPInput length={6} onOtpComplete={handleOTPComplete}/>

            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]} onPress={handleSendOTP}>
                <Text style={formStyles.styles.buttonText}>Gửi lại OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]} onPress={handleConfirmOTP}>
                <Text style={formStyles.styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
            
        </ScrollView>
    );
}