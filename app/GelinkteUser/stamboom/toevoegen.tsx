import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { readLinkedSession } from "../../utils/sessionLinked";
 
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: text ? JSON.parse(text) : null, text };
  } catch {
    return { json: null, text };
  }
}
 
async function getFamilieboomSafe(id: number) {
  try {
    const res = await fetch(`http://10.2.160.216:8000/user/familieboom/${id}`);
    const { json, text } = await safeJson(res);
 
    console.log("GET boom status:", res.status);
    console.log("GET boom body:", text);
 
    if (!res.ok) return null;
 
    const boom = Array.isArray(json) ? json[0] : json;
    if (!boom) return null;
 
    // backend kan familieboomId als string/ander veld sturen, maar we checken minimaal
    if (boom?.familieboomId == null && boom?.familieboomid == null && boom?.id == null) return null;
 
    // normaliseer alleen het id veld
    const familieboomId = Number(boom.familieboomId ?? boom.familieboomid ?? boom.id);
    if (!Number.isFinite(familieboomId)) return null;
 
    return { ...boom, familieboomId };
  } catch (e) {
    console.error("getFamilieboomSafe error:", e);
    return null;
  }
}
 
// ✅ maakt familieboom als die niet bestaat
async function createFamilieboom(ownerId: number) {
  const payload: any = {
    familieboomnaam: "Stamboom",
    gebruikerId: ownerId,     // sommige backends
    gebruikersId: ownerId,    // andere backends
    dementgebruikerId: ownerId, // soms verwachten ze dit ook
  };
 
  console.log("POST familieboom payload:", payload);
 
  const res = await fetch(`http://10.2.160.216:8000/user/familieboom`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
 
  const text = await res.text();
  console.log("POST familieboom status:", res.status);
  console.log("POST familieboom response:", text);
 
  if (!res.ok) {
    throw new Error(`Familieboom aanmaken mislukt (${res.status}): ${text}`);
  }
 
  return true;
}
 
/** converteert "DD/MM/YYYY" of "DD-MM-YYYY" naar "YYYY-MM-DD" */
function toMysqlDate(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
 
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
 
  const m = v.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (!m) return null;
 
  const dd = m[1];
  const mm = m[2];
  const yyyy = m[3];
 
  return `${yyyy}-${mm}-${dd}`;
}
 
export default function PersoonToevoegen() {
  const params = useLocalSearchParams();
  const session = readLinkedSession(params);
  if (!session) return null;
 
  // ✅ ALTIJD de demente gebruiker als owner voor de stamboom
  const ownerId = useMemo(() => session.dementgebruikerid, [session.dementgebruikerid]);
 
  const [naam, setNaam] = useState("");
  const [geboorte, setGeboorte] = useState("");
  const [sterfte, setSterfte] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [geslacht, setGeslacht] = useState<0 | 1>(0);
 
  const [loading, setLoading] = useState(false);
 
  const opslaan = async () => {
    if (!naam.trim()) {
      Alert.alert("Naam ontbreekt", "Vul een naam in.");
      return;
    }
 
    const geboorteMysql = toMysqlDate(geboorte);
    if (geboorte.trim() && !geboorteMysql) {
      Alert.alert("Foute geboortedatum", "Gebruik bv 01/01/2000 of 2000-01-01");
      return;
    }
 
    const sterfteMysql = toMysqlDate(sterfte);
    if (sterfte.trim() && !sterfteMysql) {
      Alert.alert("Foute sterftedatum", "Gebruik bv 01/01/2000 of 2000-01-01");
      return;
    }
 
    setLoading(true);
 
    try {
      // 1) probeer boom van owner (demente)
      let boom = await getFamilieboomSafe(ownerId);
 
      // 2) als geen boom -> probeer (oude fallback) session.gebruikerid
      if (!boom) boom = await getFamilieboomSafe(session.gebruikerid);
 
      // 3) als nog steeds geen boom -> maak boom aan voor owner
      if (!boom) {
        await createFamilieboom(ownerId);
        boom = await getFamilieboomSafe(ownerId);
      }
 
      if (!boom?.familieboomId) {
        Alert.alert("Fout", "Geen familieboom gevonden of aangemaakt.");
        return;
      }
 
      const payload: any = {
        familiebladnaam: naam.trim(),
        geboortedatum: geboorteMysql,
        sterftedatum: sterfteMysql,
        beschrijving: beschrijving.trim() || null,
        foto: "",
        geslacht,
 
        familieboomId: boom.familieboomId,
 
        // ✅ juiste owner
        dementgebruikerId: ownerId,
 
        moederId: null,
        vaderId: null,
      };
 
      console.log("POST payload:", payload);
 
      const res = await fetch(`http://10.2.160.216:8000/user/familieboom/blad`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
 
      const text = await res.text();
      console.log("POST status:", res.status);
      console.log("POST response:", text);
 
      if (!res.ok) {
        Alert.alert("Opslaan mislukt", `Status ${res.status}\n${text}`);
        return;
      }
 
      if (text.includes(`"error"`)) {
        Alert.alert("Backend fout", text);
        return;
      }
 
      Alert.alert("Gelukt", "Persoon toegevoegd!");
      router.back();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Netwerkfout", String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Persoon toevoegen</Text>
 
      <TextInput style={styles.input} placeholder="Naam" value={naam} onChangeText={setNaam} />
 
      <TextInput
        style={styles.input}
        placeholder="Geboortedatum (01/01/2000)"
        value={geboorte}
        onChangeText={setGeboorte}
      />
 
      <TextInput
        style={styles.input}
        placeholder="Sterftedatum (optioneel)"
        value={sterfte}
        onChangeText={setSterfte}
      />
 
      <Text style={styles.label}>Geslacht</Text>
<View style={styles.genderRow}>
<TouchableOpacity
          style={[styles.genderBtn, geslacht === 0 && styles.genderBtnActive]}
          onPress={() => setGeslacht(0)}
>
<Text style={[styles.genderText, geslacht === 0 && styles.genderTextActive]}>
            Vrouw
</Text>
</TouchableOpacity>
 
        <TouchableOpacity
          style={[styles.genderBtn, geslacht === 1 && styles.genderBtnActive]}
          onPress={() => setGeslacht(1)}
>
<Text style={[styles.genderText, geslacht === 1 && styles.genderTextActive]}>
            Man
</Text>
</TouchableOpacity>
</View>
 
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Beschrijving"
        value={beschrijving}
        onChangeText={setBeschrijving}
        multiline
      />
 
      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={opslaan}
        disabled={loading}
>
<Text style={styles.btnText}>{loading ? "Opslaan..." : "Opslaan"}</Text>
</TouchableOpacity>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F4EF" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  genderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  genderText: { fontSize: 16, fontWeight: "900", color: "#333" },
  genderTextActive: { color: "#fff" },
  btn: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});