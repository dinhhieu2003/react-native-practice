import React from "react";
import { View, Text, StyleSheet } from "react-native";

const cellSize = 50; // Kích thước ô
const spacing = 3;   // Khoảng cách giữa các ô

interface ElementProps {
  symbol: string,
  row: number,
  col: number,
  color: string,
  atomic_number: number,
}

const Element: React.FC<ElementProps> = ({ symbol, row, col, color, atomic_number }) => {
  return (
    <View
      style={[
        styles.element,
        {
          backgroundColor: color || "#ddd",
          left: (col - 1) * (cellSize + spacing),
          top: (row - 1) * (cellSize + spacing),
        },
      ]}
    >
      <Text style={styles.symbol}>{symbol}</Text>
      <Text style={styles.atomic}>{atomic_number}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  element: {
    position: "absolute",
    width: cellSize,
    height: cellSize,
    justifyContent: "center",
    alignItems: "center",
  },
  symbol: {
    height: "60%",
    width: "100%",
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  atomic: {
    height: "40%",
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#636e72"
  }
});

export default Element;
