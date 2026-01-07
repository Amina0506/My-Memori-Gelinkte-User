import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Beheren() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>Jan Peeters</Text>

      <TouchableOpacity style={styles.card}>
        <Text>Kalender</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>To-do list</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>Handleidingen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>Dagboek</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>Stamboom</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text>Wie ben ik</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, styles.emergency]}>
        <Text style={styles.emergencyText}>Noodcontacten</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "600", marginBottom: 20 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  emergency: {
    backgroundColor: "#B71C1C",
  },
  emergencyText: {
    color: "#fff",
    fontWeight: "600",
  },
});
