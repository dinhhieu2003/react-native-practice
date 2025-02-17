import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import * as SecureStore from 'expo-secure-store';

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const router = useRouter();
    const steps = [
        <View key="1"><Text>Welcome to the App!</Text></View>,
        <View key="2"><Text>Discover Amazing Features</Text></View>,
        <View key="3"><Text>Let’s Get Started!</Text></View>,
    ];

    useEffect(() => {
            SecureStore.setItem("firstLoad", "false");
            // SecureStore.deleteItemAsync("firstLoad");
        }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Onboarding</Text>
          {steps[step]}
          <Button
            title={step === steps.length - 1 ? 'Finish' : 'Next'}
            onPress={() => {
              if (step === steps.length - 1) {
                router.push("/(auth)/login");
              } else {
                setStep(step + 1);
              }
            }}
          />
        </View>
      );
}