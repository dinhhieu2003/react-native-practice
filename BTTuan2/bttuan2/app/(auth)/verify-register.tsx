import { ScrollView, View, Image, Text, TouchableOpacity } from "react-native";
import * as imgStyles from "../../styles/image";
import * as formStyles from "../../styles/form";
import { useState } from "react";
import OTPInput from "@/components/otpInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as api from "../../api/api";

export default function VerifyRegister() {
    const [otpValue, setOtpValue] = useState("");
    const { email } = useLocalSearchParams();
    const router = useRouter();
    const emailString: string = email as string;
    const handleOTPComplete = (otp: string) => {
        setOtpValue(otp);
        console.log(otp);
    }
    const handleConfirmOTP = async() => {
        const response: any = await api.verifyOTPRegister(emailString, otpValue);
        alert("Xác nhận thành công");
        router.replace("/(auth)/login");
    }
    const handleResendOTP = async() => {
        const response: any = await api.resendOTP(emailString);
        alert("OTP vừa được gửi lại");
    }
    return (
        <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
            <View style={imgStyles.styles.container}>
                <Image
                    style={imgStyles.styles.squareImg}
                    source={require("../../assets/images/verify_otp.png")}
                />
            </View>
            <Text
                style={{fontSize: 20, fontWeight: "bold", margin: "auto"}}>
                Hãy kiểm tra email của bạn
            </Text>
            <Text
                style={{margin: "auto", marginTop: 30}}>
                Nhập OTP mà chúng tôi đã gửi qua email
            </Text>

            <OTPInput length={6} onOtpComplete={handleOTPComplete}/>
            
            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]} onPress={handleConfirmOTP}>
                <Text style={formStyles.styles.buttonText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[formStyles.styles.button, {marginTop: 25}]} onPress={handleResendOTP}>
                <Text style={formStyles.styles.buttonText}>Gửi lại OTP</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}