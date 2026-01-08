import { BASE_URL } from "@/app/utils/api";
import { replaceWithLinkedSession, replaceWithPreLinkSession } from "@/app/utils/sessionLinked";
import { router } from "expo-router";
import React, { useState } from "react";
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

function hasValidLinkedUser(payload: any): boolean {
  const naam = deepFindString(payload, ["gebruikersnaam", "naam", "name", "username"]);
  const email = deepFindString(payload, ["gebruikersemail", "email", "mail"]);
  return Boolean((naam && naam.length >= 2) || (email && email.includes("@")));
}

function extractDementId(item: any): number | null {
  const n = Number(item?.dementgebruikerId ?? item?.dementegebruikerId);
  return Number.isFinite(n) ? n : null;
}

export default function Inloggen() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    const cleanId = Number(digitsOnly(id));
    if (!cleanId) return Alert.alert("Fout", "Vul een geldig ID in (enkel cijfers).");

    try {
      setLoading(true);

   
      const resUser = await fetch(`${BASE_URL}/user/linked/${cleanId}`, {
        headers: { Accept: "application/json" },
      });

      const rawUser = await resUser.text();
      let userJson: any = null;
      try { userJson = rawUser ? JSON.parse(rawUser) : null; } catch { userJson = null; }


      if (!resUser.ok || !userJson || !hasValidLinkedUser(userJson)) {
        return Alert.alert("Fout", "Deze ID bestaat niet als gelinkte gebruiker.");
      }


      const resConn = await fetch(`${BASE_URL}/user/connected/dement/${cleanId}`, {
        headers: { Accept: "application/json" },
      });

      if (resConn.ok) {
        const raw = await resConn.text();
        let list: any = null;
        try { list = raw ? JSON.parse(raw) : null; } catch { list = null; }

        if (Array.isArray(list) && list.length > 0) {
          const first = extractDementId(list[0]);
          if (first) {
            return replaceWithLinkedSession(router, "/opstart/home", {
              gebruikerid: cleanId,
              dementgebruikerid: first,
            });
          }
        }
      }

  
      replaceWithPreLinkSession(router, "/opstart/linken", { gebruikerid: cleanId });
    } catch (e: any) {
      Alert.alert("Fout", e?.message || "Inloggen mislukt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Inloggen</Text>

        <Text style={styles.label}>Login-ID</Text>
        <TextInput
          style={styles.input}
          value={id}
          onChangeText={(t) => setId(digitsOnly(t))}
          keyboardType="numeric"
          placeholder="bv. 45"
          placeholderTextColor="#9A9A9A"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={onLogin}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>{loading ? "Bezig..." : "Verder"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#F4F3EF" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E6E3DB" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", color: "rgba(45, 27, 78, 1)" },
  label: { fontSize: 13, fontWeight: "700", marginTop: 10, marginBottom: 6, color: "#222" },
  input: { borderWidth: 1, borderColor: "#E6E3DB", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#FAFAFA", color: "rgba(45, 27, 78, 1)" },
  primaryBtn: { marginTop: 16, backgroundColor: "rgba(45, 27, 78, 1)", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  disabled: { opacity: 0.6 },
});
