// app/opstart/linken.tsx
import { BASE_URL } from "@/app/utils/api";
import { readPreLinkSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const digitsOnly = (s: string) => s.replace(/\D/g, "");

function deepFindString(obj: any, keys: string[]): string | null {
  if (obj == null) return null;

  if (typeof obj === "string") return obj.trim().length ? obj.trim() : null;

  if (Array.isArray(obj)) {
    for (const it of obj) {
      const f = deepFindString(it, keys);
      if (f) return f;
    }
    return null;
  }

  if (typeof obj === "object") {
    for (const k of keys) {
      const v = (obj as any)[k];
      if (typeof v === "string" && v.trim().length) return v.trim();
    }
    for (const v of Object.values(obj)) {
      const f = deepFindString(v, keys);
      if (f) return f;
    }
  }

  return null;
}

function deepFindNumber(obj: any, keys: string[]): number | null {
  if (obj == null) return null;

  if (typeof obj === "number" && Number.isFinite(obj)) return obj;

  if (Array.isArray(obj)) {
    for (const it of obj) {
      const f = deepFindNumber(it, keys);
      if (f != null) return f;
    }
    return null;
  }

  if (typeof obj === "object") {
    for (const k of keys) {
      if (k in obj) {
        const n = Number((obj as any)[k]);
        if (Number.isFinite(n)) return n;
      }
    }
    for (const v of Object.values(obj)) {
      const f = deepFindNumber(v, keys);
      if (f != null) return f;
    }
  }

  return null;
}

function extractName(payload: any): string {
  return deepFindString(payload, ["gebruikersnaam", "naam", "name", "username"]) || "Onbekend";
}

function extractDementGebruikerId(payload: any): number | null {
  return deepFindNumber(payload, [
    "dementgebruikerId",
    "dementegebruikerId",
    "dementGebruikerId",
    "dementeGebruikerId",
    "dementId",
    "dement_id",
  ]);
}

export default function Linken() {
  const params = useLocalSearchParams();
  const pre = useMemo(() => readPreLinkSession(params), [params]);

  const [dementUserId, setDementUserId] = useState("");
  const [gevondenNaam, setGevondenNaam] = useState<string | null>(null);
  const [gevondenDementId, setGevondenDementId] = useState<number | null>(null);

  const [beschrijving, setBeschrijving] = useState("");
  const [connectietypeId, setConnectietypeId] = useState<2 | 3>(2);

  const [loadingZoek, setLoadingZoek] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  if (!pre) {
    router.replace("/opstart/inloggen" as any);
    return null;
  }

  const zoekPersoon = async () => {
    const cleanId = Number(digitsOnly(dementUserId));
    if (!cleanId) return Alert.alert("Fout", "Vul een geldige gebruikerId in (enkel cijfers).");

    try {
      setLoadingZoek(true);
      setGevondenNaam(null);
      setGevondenDementId(null);

      const res = await fetch(`${BASE_URL}/user/dement/${cleanId}`, {
        headers: { Accept: "application/json" },
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        const msg = data?.message || data?.error || raw || "Geen persoon gevonden.";
        throw new Error(String(msg));
      }

      const naam = extractName(data);
      const dementId = extractDementGebruikerId(data);

      if (!dementId) {
        console.log("Dement response (geen dementId gevonden):", data);
        throw new Error("Dement-profiel gevonden, maar dementgebruikerId ontbreekt in de response.");
      }

      setGevondenNaam(naam);
      setGevondenDementId(dementId);

      Alert.alert("Gevonden", `Demente persoon: ${naam}`);
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Zoeken mislukt.");
    } finally {
      setLoadingZoek(false);
    }
  };

  const maakConnectie = async () => {
    if (!gevondenDementId) return Alert.alert("Fout", "Zoek eerst een persoon.");
    if (!beschrijving.trim()) return Alert.alert("Fout", "Vul een beschrijving in.");

    try {
      setLoadingLink(true);

      const res = await fetch(`${BASE_URL}/user/connected/linked`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          dementegebruikerId: gevondenDementId,
          gebruikerId: pre.gebruikerid,
          beschrijving: beschrijving.trim(),
          connectietypeId,
        }),
      });

      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || raw || "Connectie maken mislukt.";
        throw new Error(String(msg));
      }

      
      router.replace({
        pathname: "/opstart/home",
        params: { gebruikerid: String(pre.gebruikerid) },
      } as any);
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Connectie maken mislukt.");
    } finally {
      setLoadingLink(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Connectie maken</Text>

        <Text style={styles.info}>
          Vul de <Text style={styles.bold}>gebruikerId</Text> van de demente persoon in.
          Klik eerst op <Text style={styles.bold}>Zoek persoon</Text> om te controleren en de naam te zien.
        </Text>

        <Text style={styles.label}>GebruikerId demente persoon</Text>
        <TextInput
          style={styles.input}
          value={dementUserId}
          onChangeText={(t) => setDementUserId(digitsOnly(t))}
          keyboardType="numeric"
          placeholder="bv. 42"
          placeholderTextColor="#9A9A9A"
        />

        <TouchableOpacity
          style={[styles.secondaryBtn, loadingZoek && styles.disabled]}
          onPress={zoekPersoon}
          disabled={loadingZoek}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryBtnText}>{loadingZoek ? "Zoeken..." : "Zoek persoon"}</Text>
        </TouchableOpacity>

        {gevondenNaam && (
          <View style={styles.foundBox}>
            <Text style={styles.foundLabel}>Gevonden persoon</Text>
            <Text style={styles.foundValue}>{gevondenNaam}</Text>
          </View>
        )}

        <Text style={styles.label}>Relatie</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, connectietypeId === 2 && styles.chipActive]}
            onPress={() => setConnectietypeId(2)}
            activeOpacity={0.9}
          >
            <Text style={[styles.chipText, connectietypeId === 2 && styles.chipTextActive]}>
              Familie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, connectietypeId === 3 && styles.chipActive]}
            onPress={() => setConnectietypeId(3)}
            activeOpacity={0.9}
          >
            <Text style={[styles.chipText, connectietypeId === 3 && styles.chipTextActive]}>
              Vriend
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Beschrijving</Text>
        <TextInput
          style={[styles.input, styles.multi]}
          value={beschrijving}
          onChangeText={setBeschrijving}
          multiline
          placeholder="bv. ik ben de zoon"
          placeholderTextColor="#9A9A9A"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, (!gevondenDementId || loadingLink) && styles.disabled]}
          onPress={maakConnectie}
          disabled={!gevondenDementId || loadingLink}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>{loadingLink ? "Bezig..." : "Connectie opslaan"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#F4F3EF" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E6E3DB" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 10, color: "#111" },
  info: { color: "#555", fontWeight: "600", marginBottom: 12, lineHeight: 18 },
  bold: { fontWeight: "900", color: "#111" },

  label: { fontSize: 13, fontWeight: "700", marginTop: 10, marginBottom: 6, color: "#222" },
  input: { borderWidth: 1, borderColor: "#E6E3DB", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#FAFAFA", color: "#111" },
  multi: { minHeight: 80, textAlignVertical: "top" },

  secondaryBtn: { marginTop: 10, borderWidth: 1, borderColor: "#111", paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: "#fff" },
  secondaryBtnText: { color: "#111", fontWeight: "800", fontSize: 14 },

  foundBox: { marginTop: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#E6E3DB", backgroundColor: "#FAFAFA" },
  foundLabel: { fontSize: 12, fontWeight: "800", color: "#666" },
  foundValue: { marginTop: 4, fontSize: 16, fontWeight: "900", color: "#111" },

  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  chip: { flex: 1, borderWidth: 1, borderColor: "#E6E3DB", backgroundColor: "#fff", borderRadius: 999, paddingVertical: 10, alignItems: "center" },
  chipActive: { borderColor: "#111" },
  chipText: { fontWeight: "800", color: "#333" },
  chipTextActive: { color: "#111" },

  primaryBtn: { marginTop: 16, backgroundColor: "#111", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  disabled: { opacity: 0.6 },
});
