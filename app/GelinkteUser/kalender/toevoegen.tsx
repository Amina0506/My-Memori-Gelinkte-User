import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
 
export default function AfspraakToevoegen() {
  const { date, dateInput } = useLocalSearchParams<{
    date: string;
    dateInput: string;
  }>();
 
  const [titel, setTitel] = useState("");
  const [locatie, setLocatie] = useState("");
  const [extra, setExtra] = useState("");
  const [uur, setUur] = useState("09:00");
  const TIMES = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30","16:00","16:30",
    "17:00","17:30","18:00","18:30","19:00","19:30","20:00",
  ];
 
  const opslaan = async () => {

    if (!titel.trim()) {
      Alert.alert("Fout", "Titel is verplicht");
      return;
    }
 
    try {
      const res = await fetch("http://10.2.160.216:8000/user/afspraken/", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          afspraaktitel: titel,
          afspraaklocatie: locatie,
          date: `${dateInput} ${uur}`,
          dementegebruikerId: 1,
          extra,

        }),

      });
 
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);

      }
 
      router.replace({

        pathname: "/GelinkteUser/kalender/succes",
        params: {
          titel,
          locatie,
          extra,
          dateTime: `${dateInput} ${uur}`,
        },

      });

    } catch (err) {

      console.error(err);
      Alert.alert("Fout", "Afspraak aanmaken mislukt");

    }

  };
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Nieuwe afspraak</Text>
 
      <Text style={styles.label}>Datum</Text>
<Text style={styles.date}>

        {new Date(date!).toLocaleDateString("nl-BE")}
</Text>
 
      <Text style={styles.label}>Uur</Text>
<View style={styles.pickerWrapper}>
<Picker selectedValue={uur} onValueChange={setUur}>

          {TIMES.map((t) => (
<Picker.Item key={t} label={t} value={t} />

          ))}
</Picker>
</View>
 
      <TextInput

        style={styles.input}
        placeholder="Titel"
        value={titel}
        onChangeText={setTitel}
      />
 
      <TextInput
        style={styles.input}
        placeholder="Locatie"
        value={locatie}
        onChangeText={setLocatie}
      />
 
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Extra info"
        value={extra}
        onChangeText={setExtra}
        multiline
      />
 
      <View style={styles.buttons}>
<TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
<Text>Annuleren</Text>
</TouchableOpacity>
 
        <TouchableOpacity style={styles.save} onPress={opslaan}>
<Text style={{ color: "#fff" }}>Afspraak aanmaken</Text>
</TouchableOpacity>
</View>
</View>

  );

}
 
const styles = StyleSheet.create({

  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  label: { fontWeight: "600" },
  date: { fontSize: 16, marginBottom: 20 },
 
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  textarea: { height: 80 },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
  cancel: {
    backgroundColor: "#ccc",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  save: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",

  },

});

 