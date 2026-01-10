// app/opstart/home.tsx
import { BASE_URL } from "@/app/utils/api";
import { readPreLinkSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

function extractDementId(payload: any): number | null {
  return deepFindNumber(payload, [
    "dementgebruikerId",
    "dementegebruikerId",
    "dementGebruikerId",
    "dementeGebruikerId",
    "dementId",
    "dement_id",
  ]);
}

type LinkedRow = {
  name: string;
  dementId: number;
  raw: any;
};

export default function OpstartHome() {
  const params = useLocalSearchParams();
  const pre = readPreLinkSession(params);

  const gebruikerid = pre?.gebruikerid ? Number(pre.gebruikerid) : null;

  const [loading, setLoading] = useState(true);
  const [linkedNaam, setLinkedNaam] = useState("...");
  const [list, setList] = useState<LinkedRow[]>([]);

  useEffect(() => {
    if (!gebruikerid) {
      router.replace("/opstart/inloggen" as any);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);

        // naam van ingelogde gebruiker
        const resL = await fetch(`${BASE_URL}/user/linked/${gebruikerid}`, {
          headers: { Accept: "application/json" },
        });
        const rawL = await resL.text();
        let dataL: any = null;
        try {
          dataL = rawL ? JSON.parse(rawL) : null;
        } catch {
          dataL = null;
        }
        setLinkedNaam(resL.ok && dataL ? extractName(dataL) : "Onbekend");

        // alle gekoppelde demente personen voor deze gebruiker
        const resD = await fetch(`${BASE_URL}/user/connected/dement/${gebruikerid}`, {
          headers: { Accept: "application/json" },
        });
        const rawD = await resD.text();
        let arr: any = null;
        try {
          arr = rawD ? JSON.parse(rawD) : null;
        } catch {
          arr = null;
        }

        if (resD.ok && Array.isArray(arr)) {
          const mapped: LinkedRow[] = arr
            .map((x: any) => {
              const did = extractDementId(x);
              if (!did) return null;
              return { dementId: did, name: extractName(x), raw: x };
            })
            .filter(Boolean) as any;

          setList(mapped);
        } else {
          setList([]);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [gebruikerid]);

  const openDement = (dementId: number) => {
    if (!gebruikerid) return;

    router.push({
      pathname: "/GelinkteUser/homeGelinkteGebruiker",
      params: {
        gebruikerid: String(gebruikerid),
        dementgebruikerid: String(dementId),
      },
    } as any);
  };

  const goToLinken = () => {
    if (!gebruikerid) return;
    router.push({
      pathname: "/opstart/linken",
      params: { gebruikerid: String(gebruikerid) },
    } as any);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welkom terug!</Text>
        <Text style={styles.sectionTitle}>Account: {linkedNaam}</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {list.length === 0 ? (
              <Text style={styles.empty}>Nog geen gekoppelde accounts.</Text>
            ) : (
              <FlatList
                data={list}
                keyExtractor={(it) => String(it.dementId)}
                style={{ width: "100%" }}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.linkCard}
                    onPress={() => openDement(item.dementId)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.linkText}>{item.name}</Text>
                      <Text style={styles.linkSubText}>Dement ID: {item.dementId}</Text>
                    </View>
                    <Text style={styles.linkArrow}>›</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.linkBtn} onPress={goToLinken} activeOpacity={0.9}>
              <Text style={styles.linkBtnText}>+ Account linken</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 18, backgroundColor: "#111" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 14, color: "#111" },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 12, color: "#111" },
  empty: { fontWeight: "800", color: "#666", marginBottom: 10 },

  linkCard: {
    width: "100%",
    backgroundColor: "#E6E6E6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  linkText: { fontSize: 18, fontWeight: "900", color: "#111" },
  linkSubText: { marginTop: 4, fontSize: 12, fontWeight: "700", color: "#666" },
  linkArrow: { marginLeft: 12, fontSize: 22, fontWeight: "900", color: "#555" },

  linkBtn: {
    marginTop: 14,
    width: "100%",
    backgroundColor: "#F2F2F2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  linkBtnText: { fontSize: 16, fontWeight: "900", color: "#111" },
});
