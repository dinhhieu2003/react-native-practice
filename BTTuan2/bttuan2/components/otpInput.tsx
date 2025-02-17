import React, { useRef, useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";

export default function OTPInput({ length = 6, onOtpComplete = (otpValue: string) => {} }) {
    const [otp, setOtp] = useState(Array(length).fill(""));
    const inputRefs = useRef<TextInput[]>([]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < length - 1) {
            inputRefs.current[index + 1].focus;
        }

        const otpValue = newOtp.join("");
        if (otpValue.length === length) {
            onOtpComplete(otpValue);
        }
    };

    return (
        <View style={styles.container}>
            {otp.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref!)}
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleChange(text, index)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    input: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderColor: "#000",
        textAlign: "center",
        fontSize: 15,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});
