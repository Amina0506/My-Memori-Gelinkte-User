import { BASE_URL } from "@/app/utils/api";
import { readLinkedSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// -------- helpers ----------
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
  return deepFindString(payload, ["gebruikersnaam", "naam", "name", "username"]) || "Onbekend";
}

function toInt(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// connected/dement response kan verschillen; we check zowel dementgebruikerId als dementegebruikerId
function extractDementRowInfo(row: any): {
  dementgebruikerId: number | null;
  gebruikerId: number | null;
  name: string;
} {
  const dementgebruikerId = toInt(row?.dementgebruikerId ?? row?.dementegebruikerId);
  const gebruikerId = toInt(row?.gebruikerId ?? row?.gebruikerid ?? row?.tblgebruikers_gebruikerId);
  const name = extractName(row);
  return { dementgebruikerId, gebruikerId, name };
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

type Counts = {
  logs: number;
  afspraken: number;
  todoLists: number;
  familieBladen: number;
  handleidingen: number;
};

export default function HomeGelinkteGebruiker() {
  const params = useLocalSearchParams();
  const session = useMemo(() => readLinkedSession(params), [params]);

  const [loading, setLoading] = useState(true);

  const [linkedNaam, setLinkedNaam] = useState("...");
  const [dementNaam, setDementNaam] = useState("...");

  const [counts, setCounts] = useState<Counts>({
    logs: 0,
    afspraken: 0,
    todoLists: 0,
    familieBladen: 0,
    handleidingen: 0,
  });

  // guard
  useEffect(() => {
    if (!session) {
      router.replace("/opstart/inloggen" as any);
    }
  }, [session]);

  // load + check connection + counts
  useEffect(() => {
    if (!session) return;

    const run = async () => {
      try {
        setLoading(true);

        // 1) linked user must exist
        const resLinked = await fetch(`${BASE_URL}/user/linked/${session.gebruikerid}`, {
          headers: { Accept: "application/json" },
        });
        if (!resLinked.ok) {
          router.replace("/opstart/inloggen" as any);
          return;
        }
        const linkedData = await safeJson(resLinked);
        setLinkedNaam(linkedData ? extractName(linkedData) : "Onbekend");

        // 2) check: is deze dementgebruikerid effectief gekoppeld aan deze gelinkte gebruiker?
        const resConnected = await fetch(`${BASE_URL}/user/connected/dement/${session.gebruikerid}`, {
          headers: { Accept: "application/json" },
        });
        const connectedList = await safeJson(resConnected);

        if (!resConnected.ok || !Array.isArray(connectedList)) {
          router.replace({
            pathname: "/opstart/linken",
            params: { gebruikerid: String(session.gebruikerid) },
          } as any);
          return;
        }

        const match = connectedList
          .map(extractDementRowInfo)
          .find((x) => x.dementgebruikerId === session.dementgebruikerid);

        if (!match || !match.dementgebruikerId) {
          router.replace({
            pathname: "/opstart/linken",
            params: { gebruikerid: String(session.gebruikerid) },
          } as any);
          return;
        }

        setDementNaam(match.name || "Onbekend");

        // 3) counts via Dement_ID endpoints
        const [
          resLogs,
          resAfspraken,
          resTodo,
          resBoom,
          resHandleidingen,
        ] = await Promise.all([
          fetch(`${BASE_URL}/user/logs/${session.dementgebruikerid}`, {
            headers: { Accept: "application/json" },
          }),
          fetch(`${BASE_URL}/user/afspraken/${session.dementgebruikerid}`, {
            headers: { Accept: "application/json" },
          }),
          fetch(`${BASE_URL}/user/todolist/${session.dementgebruikerid}`, {
            headers: { Accept: "application/json" },
          }),
          fetch(`${BASE_URL}/user/familieboom/${session.dementgebruikerid}`, {
            headers: { Accept: "application/json" },
          }),
          // ✅ Handleidingen
          fetch(`${BASE_URL}/user/handleiding/${session.dementgebruikerid}`, {
            headers: { Accept: "application/json" },
          }),
        ]);

        const logsData = await safeJson(resLogs);
        const afsprakenData = await safeJson(resAfspraken);
        const todoData = await safeJson(resTodo);
        const boomData = await safeJson(resBoom);
        const handleidingenData = await safeJson(resHandleidingen);

        const logsCount = Array.isArray(logsData) ? logsData.length : 0;
        const afsprakenCount = Array.isArray(afsprakenData) ? afsprakenData.length : 0;
        const todoCount = Array.isArray(todoData) ? todoData.length : 0;

        let bladenCount = 0;
        if (Array.isArray(boomData)) bladenCount = boomData.length;
        else if (boomData && Array.isArray(boomData?.bladen)) bladenCount = boomData.bladen.length;
        else if (boomData && Array.isArray(boomData?.familiebladen)) bladenCount = boomData.familiebladen.length;

        const handleidingenCount = Array.isArray(handleidingenData) ? handleidingenData.length : 0;

        setCounts({
          logs: logsCount,
          afspraken: afsprakenCount,
          todoLists: todoCount,
          familieBladen: bladenCount,
          handleidingen: handleidingenCount,
        });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [session?.gebruikerid, session?.dementgebruikerid]);

  if (!session) return null;

  // routes (pas aan als je binnen folders nog home.tsx gebruikt)
  const pushTo = (pathname: string) =>
    router.push({
      pathname,
      params: {
        gebruikerid: String(session.gebruikerid),
        dementgebruikerid: String(session.dementgebruikerid),
      },
    } as any);

  const goDagboek = () => pushTo("/GelinkteUser/dagboek");
  const goHandleidingen = () => pushTo("/GelinkteUser/handleidingen/alleHandleidingen");
  const goStamboom = () => pushTo("/GelinkteUser/stamboom");
  const goKalender = () => pushTo("/GelinkteUser/kalender");
  const goWieBenIk = () => pushTo("/GelinkteUser/profiel");
  const goNoodcontacten = () => pushTo("/GelinkteUser/noodcontacten");
  const goTodo = () => pushTo("/GelinkteUser/todoLijst");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={styles.headerCard}>
        <Text style={styles.h1}>Start</Text>

        {loading ? (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            <Text style={styles.label}>Ingelogd als</Text>
            <Text style={styles.value}>{linkedNaam}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Gelinkt aan</Text>
            <Text style={styles.value}>{dementNaam}</Text>
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>Functies</Text>

      <View style={styles.grid}>
        <Tile title="Dagboek" subtitle={`${counts.logs} logs`} onPress={goDagboek} />
        <Tile title="Handleidingen" subtitle={`${counts.handleidingen} handleidingen`} onPress={goHandleidingen} />
        <Tile title="Stamboom" subtitle={`${counts.familieBladen} personen`} onPress={goStamboom} />
        <Tile title="Kalender" subtitle={`${counts.afspraken} afspraken`} onPress={goKalender} />
        <Tile title="Wie ben ik" subtitle="Profiel bekijken" onPress={goWieBenIk} />
        <Tile title="Noodcontacten" subtitle="Beheren" onPress={goNoodcontacten} />
        <Tile title="To-do lijst" subtitle={`${counts.todoLists} lijsten`} onPress={goTodo} />
      </View>

      
    </ScrollView>
  );
}

function Tile({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSub}>{subtitle}</Text>
      <Text style={styles.tileArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F3EF", padding: 18 },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E3DB",
    marginTop: 10,
  },
  h1: { fontSize: 24, fontWeight: "900", color: "#3B2A63" },

  label: { marginTop: 14, color: "#666", fontWeight: "800", fontSize: 12 },
  value: { marginTop: 4, fontSize: 18, fontWeight: "900", color: "#111" },
  divider: { height: 1, backgroundColor: "#E6E3DB", marginVertical: 14 },

  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: "900", color: "#111" },

  grid: { gap: 10 },

  tile: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E3DB",
    position: "relative",
  },
  tileTitle: { fontSize: 18, fontWeight: "900", color: "#111" },
  tileSub: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#666" },
  tileArrow: {
    position: "absolute",
    right: 14,
    top: 14,
    fontSize: 22,
    fontWeight: "900",
    color: "#666",
  },

  infoCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E3DB",
  },
  infoTitle: { fontSize: 14, fontWeight: "900", color: "#111" },
  infoText: { marginTop: 6, color: "#555", fontWeight: "600", lineHeight: 18 },
});
