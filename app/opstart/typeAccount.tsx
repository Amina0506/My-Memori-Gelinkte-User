import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TypeAccount() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welkom</Text>
        <Text style={styles.subtitle}>Gelinkte gebruiker</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/opstart/profielAanmaken" as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>Profiel aanmaken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/opstart/inloggen" as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryBtnText}>Inloggen met ID</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#F4F3EF" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E3DB",
  },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center", color: "#3B2A63" },
  subtitle: { marginTop: 6, textAlign: "center", color: "#555", fontWeight: "700" },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: "rgba(45, 27, 78, 1)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#3B2A63",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#3B2A63)", fontWeight: "800", fontSize: 15 },
});
