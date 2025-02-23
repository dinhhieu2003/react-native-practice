import { useEffect } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import Element from "@/components/Element";
import * as api from "../../api/api";
import { ElementType } from "@/utils/types/type";
import { getElementColor } from "@/utils/colors";

const cellSize = 50; // Kích thước ô
const spacing = 3;   // Khoảng cách giữa các ô

const elements: ElementType[] = api.getElements();

export default function Home() {
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

  return (
    <View style={styles.screen}>
      <ScrollView horizontal style={{marginTop: 50, marginBottom: 50}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.table}>
            {elements.map((el) => (
              <Element 
                key={el.atomic_number}
                symbol={el.symbol} 
                row={el.period} 
                col={el.group} 
                color={getElementColor(el.type)}
                atomic_number={el.atomic_number}/>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    marginLeft: 50,
    marginRight: 50,
  },
  table: {
    width: 18 * (cellSize + spacing), // (18 cột)
    height: 10 * (cellSize + spacing), // (10 hàng: 7 hàng thường và 2 hàng Ac, Lan)
    position: "relative",
  },
});
