import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { readLinkedSession } from "../../utils/sessionLinked";


interface Afspraak {
  afspraaktitel: string;
  afspraaklocatie: string;
  date: string;
  extra?: string;
}

export default function KalenderDetailGelinkt() {
  const params = useLocalSearchParams();
  const session = readLinkedSession(params);

  if (!session) return null;

  const { date } = params as { date: string };
  const selectedDate = new Date(date);

  const [afspraken, setAfspraken] = useState<Afspraak[]>([]);

  useEffect(() => {
    fetch(
      `http://10.2.160.216:8000/user/afspraken/${session.dementgebruikerid}`
    )
      .then((res) => res.json())
      .then(setAfspraken)
      .catch(console.error);
  }, []);

  const afsprakenVoorDag = afspraken.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
<View style={styles.container}>
  <ScrollView showsVerticalScrollIndicator={false}>
    <Text style={styles.title}>
      Afspraken op{"\n"}
      {selectedDate.toLocaleDateString("nl-BE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
    </Text>

    {afsprakenVoorDag.length === 0 ? (
      <Text style={styles.empty}>Geen afspraken op deze dag</Text>
    ) : (
      afsprakenVoorDag.map((a, i) => {
        const d = new Date(a.date);
        return (
          <View key={i} style={styles.card}>
            <Text style={styles.name}>{a.afspraaktitel}</Text>
            <Text style={styles.text}>
              📍 Plaats: {a.afspraaklocatie || "-"}
            </Text>
            <Text style={styles.text}>
              ⏰ Tijd:{" "}
              {d.toLocaleTimeString("nl-BE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {a.extra ? <Text style={styles.text}>📝 {a.extra}</Text> : null}
          </View>
        );
      })
    )}

    <TouchableOpacity
      style={styles.addBtn}
      onPress={() =>
        router.push({
          pathname: "/GelinkteUser/kalender/toevoegen",
          params: {
            date: selectedDate.toISOString(),
            dateInput: `${selectedDate.getFullYear()}-${String(
              selectedDate.getMonth() + 1
            ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
            gebruikerid: String(session.gebruikerid),
            dementgebruikerid: String(session.dementgebruikerid),
          },
        })
      }
    >
      <Text style={styles.addBtnText}>+ Nog een afspraak toevoegen</Text>
    </TouchableOpacity>
  </ScrollView>
</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F4EF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  empty: {
    fontSize: 18,
    color: "#666",
  },
  card: {
    backgroundColor: "#F1F1F1",
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 6,
  },
  addBtn: {
  backgroundColor: "#4CAF50",
  padding: 16,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 20,
},
addBtnText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},

});
