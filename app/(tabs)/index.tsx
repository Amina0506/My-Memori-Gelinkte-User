import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/homeMyMemori.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>My Memori</Text>
        <Text style={styles.subtitle}>Welkom bij My Memori</Text>
      </View>

      {/* RELATIVE href (vanuit app/(tabs) naar app/opstart) */}
      <Link href="../opstart/typeAccount" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Accepteren en doorgaan</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 36,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 34,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2D1B4E",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#8A8A8A",
  },
  button: {
    backgroundColor: "#6A3CBC",
    paddingVertical: 15,
    paddingHorizontal: 34,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
