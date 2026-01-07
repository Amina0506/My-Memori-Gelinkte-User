import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GelinkteHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welkom terug!</Text>

      <Text style={styles.subtitle}>Gelinkte accounts</Text>

      {/* Gelinkte persoon */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/GelinkteUser/beheren")}
      >
        <Text style={styles.name}>Jan Peeters</Text>
      </TouchableOpacity>

      {/* Account linken */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/GelinkteUser/accountLinken")}
      >
        <Text style={styles.addText}>+ Account linken</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "600", marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10 },
  card: {
    padding: 16,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 20,
  },
  name: { fontSize: 18 },
  addButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  addText: { fontSize: 16 },
});
