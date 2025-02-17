import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: "auto",
      width: width * 0.85
    },
    input: {
      width: width * 0.85,
      height: 50,
      margin: "auto",
      borderWidth: 3,
      borderColor: "#ccc",
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
    },
    button: {
      backgroundColor: "#007BFF",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: "85%",
      alignItems: "center",
      margin: "auto",
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
  });