import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { readLinkedSession } from "../../utils/sessionLinked";
 
const BASE_URL = "http://10.2.160.216:8000";
 
interface User {
  gebruikersnaam?: string;
  geboortedatum?: string;
  adres?: string;
  leeftoestand?: string;
}
 
async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
 
function digitsId(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
 
function formatDate(date: any): string {
  if (!date) return "-";
 
  if (typeof date === "string" && date.length >= 10) {
    return date.slice(0, 10);
  }
 
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toISOString().slice(0, 10);
  } catch {
    return "-";
  }
}
 

export default function ProfielGelinkt() {
  const params = useLocalSearchParams();
  const session = readLinkedSession(params);
 
  const dementeGebruikerId = useMemo(() => {
    const v =
      (params as any)?.dementeGebruikerId ?? (params as any)?.dementId;
    return digitsId(v);
  }, [params]);
 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);
 
  const [user, setUser] = useState<User | null>(null);
 
  const [naam, setNaam] = useState("");
  const [geboortedatum, setGeboortedatum] = useState("");
  const [adres, setAdres] = useState("");
  const [leeftoestand, setLeeftoestand] = useState("");
 
  const fetchProfiel = async () => {
    if (!session || !dementeGebruikerId) return;
 
    try {
      setLoading(true);
 
      const url = `${BASE_URL}/user/dement/${dementeGebruikerId}`;
      const res = await fetch(url);
      const data = await res.json();
 
      const u =
        Array.isArray(data) && data.length > 0
          ? data[0]
          : data && typeof data === "object"
          ? data
          : null;
 
      if (!u) {
        setUser(null);
        return;
      }
 
      setUser(u);
 
      setNaam(u.gebruikersnaam ?? "");
      setGeboortedatum(formatDate(u.geboortedatum));
      setAdres(u.adres ?? "");
      setLeeftoestand(u.leeftoestand ?? "");
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchProfiel();
  }, [session?.gebruikerid, dementeGebruikerId]);
 
  const saveChanges = async () => {
    if (!session || !dementeGebruikerId) return;
 
    setSaving(true);
 
    try {
      // USER
      const userUrl = `${BASE_URL}/user/${dementeGebruikerId}`;
      const userPayload = {
        gebruikersnaam: naam,
        geboortedatum,
      };
 
      let userOk = true;
      const resUser = await fetch(userUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });
 
      if (!resUser.ok) userOk = false;
 
      // DEMENT
      const dementIdForPatch =
        session.dementgebruikerid ?? dementeGebruikerId;
      const dementUrl = `${BASE_URL}/user/dement/${dementIdForPatch}`;
      const dementPayload = { adres, leeftoestand };
 
      const resDement = await fetch(dementUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dementPayload),
      });
 
      if (!resDement.ok) {
        const txt = await safeText(resDement);
        throw new Error(txt || "Dement PATCH faalde");
      }
 
      setUser((prev) => ({
        ...(prev ?? {}),
        gebruikersnaam: naam,
        geboortedatum,
        adres,
        leeftoestand,
      }));
 
      if (!userOk) {
        Alert.alert(
          "Gedeeltelijk opgeslagen",
          "Adres en leeftoestand zijn opgeslagen. Naam/geboortedatum niet."
        );
      } else {
        Alert.alert("Succes", "Alles opgeslagen");
      }
 
      setEdit(false);
      fetchProfiel();
    } catch (err: any) {
      Alert.alert("Fout", err?.message || "Onverwachte fout");
    } finally {
      setSaving(false);
    }
  };
 
  if (!session || !dementeGebruikerId) {
    return (
<View style={styles.center}>
<Text>Session of dementeGebruikerId ontbreekt</Text>
</View>
    );
  }
 
  if (loading) {
    return (
<View style={styles.center}>
<ActivityIndicator size="large" />
</View>
    );
  }
 
  if (!user) {
    return (
<View style={styles.center}>
<Text>Geen profiel gevonden</Text>
</View>
    );
  }
 
  return (
<ScrollView style={{ flex: 1, backgroundColor: "#F9F4EF" }}>
<View style={styles.container}>
<View style={styles.card}>
<Text style={styles.title}>Profiel</Text>
 
          {edit ? (
<>
<TextInput
                style={styles.input}
                value={naam}
                onChangeText={setNaam}
                placeholder="Naam"
              />
 
              <TextInput
                style={styles.input}
                value={geboortedatum}
                onChangeText={setGeboortedatum}
                placeholder="YYYY-MM-DD"
              />
 
              <TextInput
                style={styles.input}
                value={adres}
                onChangeText={setAdres}
                placeholder="Adres"
              />
 
              <TextInput
                style={styles.input}
                value={leeftoestand}
                onChangeText={setLeeftoestand}
                placeholder="Leeftoestand"
              />
 
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={saveChanges}
                disabled={saving}
>
<Text style={styles.btnText}>
                  {saving ? "Opslaan..." : "Opslaan"}
</Text>
</TouchableOpacity>
 
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEdit(false);
                  setNaam(user.gebruikersnaam ?? "");
                  setGeboortedatum(formatDate(user.geboortedatum));
                  setAdres(user.adres ?? "");
                  setLeeftoestand(user.leeftoestand ?? "");
                }}
                disabled={saving}
>
<Text>Annuleren</Text>
</TouchableOpacity>
</>
          ) : (
<>
<Text style={styles.text}>
                Naam: {user.gebruikersnaam ?? "-"}
</Text>
<Text style={styles.text}>
                Geboortedatum: {formatDate(user.geboortedatum)}
</Text>
<Text style={styles.text}>
                Adres: {user.adres ?? "-"}
</Text>
<Text style={styles.text}>
                Leeftoestand: {user.leeftoestand ?? "-"}
</Text>
 
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEdit(true)}
>
<Text style={styles.btnText}>Bewerken</Text>
</TouchableOpacity>
</>
          )}
</View>
</View>
</ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, paddingTop: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E3DB",
  },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  editBtn: {
    backgroundColor: "#8757D8",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelBtn: { marginTop: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});