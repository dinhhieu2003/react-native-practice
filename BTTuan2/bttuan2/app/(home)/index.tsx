import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import Element from "@/components/Element";
import * as api from "../../api/api";
import { ElementType } from "@/utils/types/type";
import { getElementColor } from "@/utils/colors";
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


const cellSize = 50; // Kích thước ô
const spacing = 3;   // Khoảng cách giữa các ô

const elements: ElementType[] = api.getElements();

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  const scale = useSharedValue(1); // Giá trị zoom

  // Xử lý zoom với Gesture API
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale; // Cập nhật scale khi pinch
    })
    .onEnd(() => {
      scale.value = withSpring(Math.max(1, Math.min(scale.value, 3))); // Giới hạn scale từ 1 đến 3
    });

  // Áp dụng scale cho bảng tuần hoàn
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggleGroup = (group: number) => {
    setSelectedGroup(selectedGroup === group ? null : group);
  };

  const togglePeriod = (period: number) => {
    setSelectedPeriod(selectedPeriod === period ? null : period);
  };

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
      {/* Filter group button */}
      <View style={styles.groupFilter}>
        <Text>Group: </Text>
        {[...Array(18)].map((_, index) => {
          const group = index + 1;
          const isSelected = selectedGroup === group;
          return (
            <TouchableOpacity
              key={group}
              style={[
                styles.groupButton,
                { backgroundColor: isSelected ? getElementColor(`Group ${group}`) : "#ccc" }
              ]}
              onPress={() => toggleGroup(group)}
            >
              <Text style={styles.groupText}>{group}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter period button */}
      <View style={styles.groupFilter}>
        <Text>Period: </Text>
        {[...Array(7)].map((_, index) => {
          const period = index + 1;
          const isSelected = selectedPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              style={[
                styles.groupButton,
                { backgroundColor: isSelected ? "#007BFF" : "#ccc" }
              ]}
              onPress={() => togglePeriod(period)}
            >
              <Text style={styles.groupText}>{period}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Periodic table */}
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={pinchGesture}>
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
            <ScrollView horizontal style={{marginTop: 20, marginBottom: 50}}>
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.table}>
                  {elements.map((el) => {
                    let isDimmed =
                      (selectedGroup !== null && el.group !== selectedGroup) ||
                      (selectedPeriod !== null && el.period !== selectedPeriod);
                    if((el.type === "Actinide" || el.type === "Lanthanide") 
                        && selectedGroup !== null
                        && selectedPeriod !== null)
                      isDimmed = true;
                  return ( 
                    <Element 
                      key={el.atomic_number}
                      symbol={el.symbol} 
                      row={el.period} 
                      col={el.group} 
                      color={isDimmed ? "#ccc" : getElementColor(el.type)}
                      atomic_number={el.atomic_number}/>
                  )})}
                </View>
              </ScrollView>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  groupFilter: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 3 },
  groupButton: { width: 13, height: 13, justifyContent: "center", alignItems: "center", margin: 5 },
  groupText: { fontSize: 6, fontWeight: "bold", color: "black" },
});
