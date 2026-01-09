import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AfspraakSuccess() {
  const {
    titel,
    locatie,
    extra,
    dateTime,
    gebruikerid,
    dementgebruikerid,
  } = useLocalSearchParams<{
    titel?: string;
    locatie?: string;
    extra?: string;
    dateTime?: string;
    gebruikerid?: string;
    dementgebruikerid?: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Afspraak toegevoegd</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Titel</Text>
        <Text style={styles.value}>{titel}</Text>

        <Text style={styles.label}>Datum en uur</Text>
        <Text style={styles.value}>{dateTime}</Text>

        <Text style={styles.label}>Locatie</Text>
        <Text style={styles.value}>{locatie || "-"}</Text>

        <Text style={styles.label}>Benodigdheden</Text>
        <Text style={styles.value}>{extra || "-"}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          router.replace({
            pathname: "/GelinkteUser/kalender",
            params: {
              refresh: Date.now().toString(),
              gebruikerid,
              dementgebruikerid,
            },
          })
        }
      >
        <Text style={styles.btnText}>Terug naar kalender</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F4EF",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 400,
  },
  label: { fontWeight: "700", marginTop: 10, fontSize: 20 },
  value: { fontSize: 18, marginTop: 4 },
  btn: {
    backgroundColor: "#8757D8",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
