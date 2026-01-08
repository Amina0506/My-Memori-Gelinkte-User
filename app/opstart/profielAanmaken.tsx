import { BASE_URL } from "@/app/utils/api";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const digitsOnly = (s: string) => s.replace(/\D/g, "");
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d.trim());
const isPhone = (p: string) => /^0\d{9}$/.test(p);

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

function extractCreatedId(payload: any): number | null {

  return deepFindNumber(payload, ["gebruikerId", "id", "linkedId", "linkedUserId"]);
}

export default function ProfielAanmaken() {
  const [email, setEmail] = useState("");
  const [naam, setNaam] = useState("");
  const [geboorte, setGeboorte] = useState("");
  const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    const payload = {
      gebruikersemail: email.trim(),
      gebruikersnaam: naam.trim(),
      geboortedatum: geboorte.trim(), // YYYY-MM-DD
      telefoonnummer: digitsOnly(tel),
      taalId: 1,
    };

    if (!isEmail(payload.gebruikersemail)) return Alert.alert("Fout", "Vul een geldige e-mail in.");
    if (!payload.gebruikersnaam) return Alert.alert("Fout", "Vul je naam in.");
    if (!isDate(payload.geboortedatum)) return Alert.alert("Fout", "Geboortedatum moet YYYY-MM-DD zijn.");
    if (!isPhone(payload.telefoonnummer)) return Alert.alert("Fout", "Telefoon moet 10 cijfers zijn en starten met 0.");

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/user/linked`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

      if (!res.ok) {
        const msg = (data?.message || data?.error || raw || "Could not create user").toString();
        throw new Error(msg);
      }

      const createdId = extractCreatedId(data);

      if (createdId) {
        Alert.alert(
          "Gelukt",
          `Account aangemaakt!\nJouw login-ID: ${createdId}\nBewaar dit ID.`,
          [{ text: "Inloggen", onPress: () => router.replace("/opstart/inloggen" as any) }]
        );
      } else {
        Alert.alert(
          "Gelukt",
          "Account aangemaakt!\nMaar de server stuurde geen ID terug.\nVraag het ID op via de database/admin (of laat dev een endpoint maken).",
          [{ text: "Inloggen", onPress: () => router.replace("/opstart/inloggen" as any) }]
        );
      }
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Could not create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Profiel aanmaken</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="naam@mail.com" placeholderTextColor="#9A9A9A" />

        <Text style={styles.label}>Naam</Text>
        <TextInput style={styles.input} value={naam} onChangeText={setNaam} placeholder="Jouw naam" placeholderTextColor="#9A9A9A" />

        <Text style={styles.label}>Geboortedatum (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={geboorte} onChangeText={setGeboorte} placeholder="2000-01-31" placeholderTextColor="#9A9A9A" />

        <Text style={styles.label}>Telefoon (0xxxxxxxxx)</Text>
        <TextInput style={styles.input} value={tel} onChangeText={(t) => setTel(digitsOnly(t))} keyboardType="numeric" placeholder="0479123456" placeholderTextColor="#9A9A9A" />

        <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabled]} onPress={onCreate} disabled={loading} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>{loading ? "Bezig..." : "Aanmaken"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#F4F3EF" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E6E3DB" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 10, color: "#3B2A63" },
  label: { fontSize: 13, fontWeight: "700", marginTop: 10, marginBottom: 6, color: "#222" },
  input: { borderWidth: 1, borderColor: "#E6E3DB", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#FAFAFA", color: "#111" },
  primaryBtn: { marginTop: 16, backgroundColor: "#3B2A63", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  disabled: { opacity: 0.6 },
});
