import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { readLinkedSession } from "../../utils/sessionLinked";

const DAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

interface Afspraak {
  afspraaktitel: string;
  afspraaklocatie: string;
  date: string;
}

export default function KalenderGelinkt() {
  const params = useLocalSearchParams();
  const session = readLinkedSession(params);

  if (!session) return null;

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [afspraken, setAfspraken] = useState<Afspraak[]>([]);
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("nl-BE", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  
  const fetchAfspraken = () => {
    fetch(`http://10.2.160.216:8000/user/afspraken/${session.dementgebruikerid}`)
      .then((res) => res.json())
      .then(setAfspraken)
      .catch(console.error);
  };

  useEffect(() => {
    fetchAfspraken();
  }, []);

  useEffect(() => {
    if (refresh) fetchAfspraken();
  }, [refresh]);

  const hasAppointment = (day: number) =>
    afspraken.some((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies een datum</Text>

      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.month}>{monthName} {year}</Text>

        <TouchableOpacity onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      <FlatList
        data={days}
        numColumns={7}
        keyExtractor={(_, i) => i.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          if (!item) return <View style={styles.emptyDay} />;
          const afspraakBestaat = hasAppointment(item);

          return (
            <TouchableOpacity
              style={[styles.day, hasAppointment(item) && styles.dayHasAppointment]}
          onPress={() =>
  router.push({
    pathname: afspraakBestaat
      ? "/GelinkteUser/kalender/detaildag"
      : "/GelinkteUser/kalender/toevoegen",
    params: {
      date: new Date(year, month, item).toISOString(),
      dateInput: `${year}-${String(month + 1).padStart(2, "0")}-${String(item).padStart(2, "0")}`,
      gebruikerid: String(session.gebruikerid),
      dementgebruikerid: String(session.dementgebruikerid),
    },
  })
}

            >
              <Text style={styles.dayText}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F4EF" },
  title: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 30 },
  monthRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  arrow: { fontSize: 24, paddingHorizontal: 20 },
  month: { fontSize: 18, fontWeight: "600" },
  weekRow: { flexDirection: "row", marginTop: 15 },
  weekDay: { flex: 1, textAlign: "center", fontWeight: "600" },
  day: { flex: 1, height: 45, justifyContent: "center", alignItems: "center", margin: 4, borderRadius: 6 },
  dayHasAppointment: { backgroundColor: "#CDEFFF" },
  dayText: { fontSize: 16, fontWeight: "500" },
  emptyDay: { flex: 1, height: 45, margin: 4 },
});
