import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as api from "@/api/api";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from "expo-router";
import PeriodicTableWithFilter from "@/components/PeriodicTableWithFilter";
import { ElementType } from "@/utils/types/type";

const cellSize = 50; // Kích thước ô
const spacing = 3;   // Khoảng cách giữa các ô

const elements: ElementType[] = api.getElements();

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Xoay ngang màn hình khi vào trang
    const changeOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    };

    changeOrientation();

    // Reset về chế độ mặc định khi rời trang
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);

  // Define the element press handler for the Home screen
  const handleElementPress = (element: ElementType) => {
    console.log(`Home screen: Element ${element.name} pressed. Recording view...`);

    // Call API to record view (fire-and-forget)
    api.recordElementView(element.atomic_number).then(response => {
        if (response) {
            console.log(`View recorded for element ${element.atomic_number}:`, response.message || 'Success');
        } else {
            // Error already logged in api.ts
        }
    });

    // Navigate to the detail screen
    router.push(`/(element)/${element.atomic_number}`);
  };

  return (
    <GestureHandlerRootView style={styles.screen}>
      {/* Replace periodic table UI with the reusable component */}
      <PeriodicTableWithFilter onElementPress={handleElementPress} />
      {/* Note: No selectedElementId needed for Home screen */}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
