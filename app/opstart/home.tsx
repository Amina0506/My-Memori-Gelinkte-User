import { BASE_URL } from "@/app/utils/api";
import { readLinkedSession, readPreLinkSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

function extractName(payload: any): string {
  return (
    deepFindString(payload, ["gebruikersnaam", "naam", "name", "username"]) ||
    "Onbekend"
  );
}

function extractDementId(payload: any): number | null {
  const n = Number(payload?.dementgebruikerId ?? payload?.dementegebruikerId);
  return Number.isFinite(n) ? n : null;
}


export default function OpstartHome() {
  const params = useLocalSearchParams();

  const linked = readLinkedSession(params); // { gebruikerid, dementgebruikerid } als gekoppeld
  const pre = readPreLinkSession(params);   // { gebruikerid } als enkel ingelogd

  const gebruikerid = linked?.gebruikerid ?? pre?.gebruikerid ?? null;
  const dementgebruikeridFromParams = linked?.dementgebruikerid ?? null;

  const [linkedNaam, setLinkedNaam] = useState("...");
  const [dementNaam, setDementNaam] = useState("...");
  const [dementgebruikerid, setDementgebruikerid] = useState<number | null>(
    dementgebruikeridFromParams
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gebruikerid) {
      router.replace("/opstart/inloggen" as any);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);

      
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

        const resD = await fetch(
          `${BASE_URL}/user/connected/dement/${gebruikerid}`,
          { headers: { Accept: "application/json" } }
        );
        const rawD = await resD.text();
        let list: any = null;
        try {
          list = rawD ? JSON.parse(rawD) : null;
        } catch {
          list = null;
        }

        if (resD.ok && Array.isArray(list) && list.length > 0) {
          const chosen =
            dementgebruikeridFromParams != null
              ? list.find(
                  (x: any) => extractDementId(x) === dementgebruikeridFromParams
                ) || list[0]
              : list[0];

          setDementNaam(extractName(chosen));
          setDementgebruikerid(extractDementId(chosen));
        } else {
          setDementNaam("Niet gekoppeld");
          setDementgebruikerid(null);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [gebruikerid]);

  const openGelinkteUserHome = () => {
    if (!gebruikerid) return;

    // nog niet gekoppeld => eerst linken
    if (!dementgebruikerid) {
      return router.push({
        pathname: "/opstart/linken",
        params: { gebruikerid: String(gebruikerid) },
      } as any);
    }

    
    router.push({
      pathname: "/GelinkteUser/homeGelinkteGebruiker",
      params: {
        gebruikerid: String(gebruikerid),
        dementgebruikerid: String(dementgebruikerid),
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
        <Text style={styles.title}>Welkom terug !</Text>

        <Text style={styles.sectionTitle}>Gelinkte account</Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <TouchableOpacity
              style={styles.linkCard}
              onPress={openGelinkteUserHome}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.linkText}>{linkedNaam}</Text>
                <Text style={styles.linkSubText}>
                  {dementgebruikerid
                    ? `Gelinkt aan: ${dementNaam}`
                    : "Nog niet gekoppeld (klik om te linken)"}
                </Text>
              </View>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={goToLinken}
              activeOpacity={0.9}
            >
              <Text style={styles.linkBtnText}>+Account linken</Text>
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
  title: { fontSize: 22, fontWeight: "900", marginBottom: 22, color: "#111" },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12, color: "#111" },

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
  linkBtnText: { fontSize: 16, fontWeight: "900", color: "#A0A0A0" },
});
