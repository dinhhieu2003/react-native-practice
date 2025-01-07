import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello, I'm Hieu</Text>
    </View>
  );
}
