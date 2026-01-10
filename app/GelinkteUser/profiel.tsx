// app/GelinkteUser/profiel.tsx
import { BASE_URL } from "@/app/utils/api";
import { readLinkedSession, readPreLinkSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
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


async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

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

function extractName(payload: any): string {
  return (
    deepFindString(payload, ["gebruikersnaam", "naam", "name", "username"]) ||
    "Onbekend"
  );
}


function normalizeToIsoDate(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";

  // backend datetime => neem enkel YYYY-MM-DD
  const isoPrefix = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoPrefix)) return isoPrefix;

  // UI => DD/MM/YYYY
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}

/** ISO "YYYY-MM-DD" -> "DD/MM/YYYY" */
function isoToNl(iso: string): string {
  const s = (iso || "").trim();
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return "";
  const [, y, mm, dd] = m;
  return `${dd}/${mm}/${y}`;
}

// PATCH/PUT proberen (linked)
async function updateLinkedAny(id: number, body: any) {
  const endpoints = [
    { method: "PATCH", url: `${BASE_URL}/user/linked/${id}` },
    { method: "PUT", url: `${BASE_URL}/user/linked/${id}` },
    { method: "PATCH", url: `${BASE_URL}/user/verzorger/${id}` },
    { method: "PUT", url: `${BASE_URL}/user/verzorger/${id}` },
  ] as const;

  let last: any = null;

  for (const e of endpoints) {
    try {
      const res = await fetch(e.url, {
        method: e.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await safeJson(res);

      if (res.ok) return { ok: true, url: e.url, method: e.method, data };

      last = {
        ok: false,
        url: e.url,
        method: e.method,
        status: res.status,
        data,
      };
    } catch (err: any) {
      last = {
        ok: false,
        url: e.url,
        method: e.method,
        error: err?.message ?? String(err),
      };
    }
  }

  throw new Error(
    `Opslaan mislukt.\nLaatste poging: ${last?.method} ${last?.url}\nStatus: ${
      last?.status ?? "?"
    }`
  );
}

type ConnectedDement = {
  gebruikersnaam?: string;
  naam?: string;
};

export default function GelinkteProfiel() {
  const params = useLocalSearchParams();
  const linked = useMemo(() => readLinkedSession(params), [params]);
  const pre = useMemo(() => readPreLinkSession(params), [params]);

  const gebruikerid = linked?.gebruikerid ?? pre?.gebruikerid ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [connected, setConnected] = useState<ConnectedDement[]>([]);

  // form
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [geboorteNl, setGeboorteNl] = useState(""); // DD/MM/YYYY
  const [telefoon, setTelefoon] = useState("");

  // ✅ taal standaard 1
  const taalId = 1;

  useEffect(() => {
    if (!gebruikerid) {
      router.dismissAll();
      router.replace("/opstart/inloggen" as any);
    }
  }, [gebruikerid]);

  const reload = async () => {
    if (!gebruikerid) return;

    // linked user
    const resU = await fetch(`${BASE_URL}/user/linked/${gebruikerid}`, {
      headers: { Accept: "application/json" },
    });
    const dataU = await safeJson(resU);

    if (!resU.ok || !dataU) {
      const msg =
        (typeof dataU === "object" && (dataU?.message || dataU?.error)) ||
        (typeof dataU === "string" ? dataU : null) ||
        "Kon gebruiker niet laden.";
      throw new Error(String(msg));
    }

    const u = Array.isArray(dataU) ? dataU[0] : dataU;

    setNaam(String(u?.gebruikersnaam ?? ""));
    setEmail(String(u?.gebruikersemail ?? ""));

    
    const iso = normalizeToIsoDate(String(u?.geboortedatum ?? ""));
    setGeboorteNl(isoToNl(iso));

    setTelefoon(digitsOnly(String(u?.telefoonnummer ?? "")));

    // connected dementen
    const resC = await fetch(`${BASE_URL}/user/connected/dement/${gebruikerid}`, {
      headers: { Accept: "application/json" },
    });
    const dataC = await safeJson(resC);

    if (resC.ok && Array.isArray(dataC)) setConnected(dataC);
    else setConnected([]);
  };

  useEffect(() => {
    if (!gebruikerid) return;

    const run = async () => {
      try {
        setLoading(true);
        await reload();
      } catch (e: any) {
        Alert.alert("Fout", e?.message ?? "Laden mislukt.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [gebruikerid]);

  const save = async () => {
    if (!gebruikerid) return;

    if (!naam.trim()) return Alert.alert("Fout", "Naam mag niet leeg zijn.");
    if (!email.trim() || !email.includes("@"))
      return Alert.alert("Fout", "Vul een geldig e-mail adres in.");
    if (!geboorteNl.trim())
      return Alert.alert("Fout", "Vul geboortedatum in (DD/MM/YYYY).");

    const iso = normalizeToIsoDate(geboorteNl);
    if (!iso)
      return Alert.alert(
        "Fout",
        "Geboortedatum moet zo zijn: DD/MM/YYYY (bv 01/02/2003)."
      );

    if (telefoon.length < 9)
      return Alert.alert("Fout", "Vul een geldig telefoonnummer in.");

    try {
      setSaving(true);

      const body = {
        gebruikersemail: email.trim(),
        gebruikersnaam: naam.trim(),
        geboortedatum: iso, 
        telefoonnummer: Number(telefoon),
        taalId: taalId,
      };

      await updateLinkedAny(Number(gebruikerid), body);

      // herladen om UI zeker correct te tonen
      await reload();

      Alert.alert("Gelukt", "Je gegevens zijn veranderd.");
    } catch (e: any) {
      Alert.alert("Fout", e?.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    Alert.alert("Uitloggen", "Ben je zeker dat je wilt uitloggen?", [
      { text: "Annuleer", style: "cancel" },
      {
        text: "Log uit",
        style: "destructive",
        onPress: () => {
   
          router.dismissAll();
          
          router.replace("/opstart/inloggen" as any);
        },
      },
    ]);
  };

  if (!gebruikerid) return null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, fontWeight: "700", color: "#666" }}>
          Laden...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Profiel</Text>

      {/* Gelinkt aan (naam + link knop terug) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gelinkt aan</Text>

        {connected.length === 0 ? (
          <Text style={styles.muted}>Nog geen gekoppelde demente accounts.</Text>
        ) : (
          connected.map((c, idx) => {
            const nm = c.gebruikersnaam ?? c.naam ?? extractName(c) ?? "Onbekend";
            return (
              <View key={idx} style={styles.linkRow}>
                <Text style={styles.linkName}>{nm}</Text>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            router.push({
              pathname: "/opstart/linken",
              params: { gebruikerid: String(gebruikerid) },
            } as any)
          }
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryBtnText}>+ Account linken</Text>
        </TouchableOpacity>
      </View>

      {/* Mijn gegevens */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mijn gegevens</Text>

        <Text style={styles.label}>Naam</Text>
        <TextInput value={naam} onChangeText={setNaam} style={styles.input} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Geboortedatum (DD/MM/YYYY)</Text>
        <TextInput
          value={geboorteNl}
          onChangeText={setGeboorteNl}
          style={styles.input}
          placeholder="01/02/2003"
        />

        <Text style={styles.label}>Telefoon (enkel cijfers)</Text>
        <TextInput
          value={telefoon}
          onChangeText={(t) => setTelefoon(digitsOnly(t))}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="04..."
        />

        <TouchableOpacity
          style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.smallNote}>Taal staat standaard op ID 1.</Text>
      </View>

      {/* Logout */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sessie</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.9}>
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F3EF", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F4F3EF" },

  title: { fontSize: 24, fontWeight: "900", color: "#111", marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E3DB",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 10 },
  muted: { color: "#666", fontWeight: "700" },

  linkRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  linkName: { fontSize: 16, fontWeight: "900", color: "#111" },

  label: { fontSize: 12, fontWeight: "900", color: "#222", marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E6E3DB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
    color: "#111",
    fontWeight: "700",
  },

  primaryBtn: { marginTop: 16, backgroundColor: "#111", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  secondaryBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#111",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#111", fontWeight: "900", fontSize: 14 },

  smallNote: { marginTop: 10, color: "#666", fontWeight: "700", fontSize: 12 },

  logoutBtn: { backgroundColor: "#C62828", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});
