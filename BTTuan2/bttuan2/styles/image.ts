import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export const styles = StyleSheet.create({
  squareImg: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 10,
    resizeMode: "stretch",
  },
  container: {
    flex: 1,
    marginTop: 50,
    marginBottom: 50,
    alignItems: "center",
  }
});