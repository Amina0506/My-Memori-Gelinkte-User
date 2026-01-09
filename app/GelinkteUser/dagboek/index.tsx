import { BASE_URL } from "@/app/utils/api";
import { readLinkedSession } from "@/app/utils/sessionLinked";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ---------------- helpers ----------------
function toInt(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractDementId(row: any): number | null {
  return toInt(row?.dementgebruikerId ?? row?.dementegebruikerId);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function deepFindString(obj: any, keys: string[]): string | null {
  if (!obj) return null;
  if (typeof obj === "string") return obj.trim() || null;

  if (Array.isArray(obj)) {
    for (const it of obj) {
      const f = deepFindString(it, keys);
      if (f) return f;
    }
  }

  if (typeof obj === "object") {
    for (const k of keys) {
      const v = (obj as any)[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

function extractContent(log: any): string {
  return (
    deepFindString(log, ["logcontent", "content", "tekst", "beschrijving"]) ||
    "(Geen inhoud)"
  );
}

function extractDateRaw(log: any): string | null {
  return deepFindString(log, [
    "datum",
    "date",
    "createdAt",
    "aanmaakdatum",
    "created_at",
  ]);
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;

  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  // fallback YYYY-MM-DD
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const da = Number(m[3]);
    const d2 = new Date(y, mo, da);
    return isNaN(d2.getTime()) ? null : d2;
  }

  return null;
}

function formatDateNL(d: Date): string {
  const maanden = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return `${d.getDate()} ${maanden[d.getMonth()]} ${d.getFullYear()}`;
}

function extractLogId(log: any, fallbackIndex: number): string {
  const id =
    log?.logId ??
    log?.id ??
    log?.logboekId ??
    log?.logboekID ??
    log?.log_id ??
    null;

  const n = toInt(id);
  return n != null ? String(n) : `idx-${fallbackIndex}`;
}

function previewText(text: string, maxChars = 90) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).trim() + "…";
}

// ---------------- colors ----------------
const PRIMARY = "rgba(45, 27, 78, 1)";
const SECONDARY = "#5B4A84";
const ACCENT = "#3B2A63";

// ---------------- screen ----------------
export default function DagboekIndex() {
  const params = useLocalSearchParams();
  const session = useMemo(() => readLinkedSession(params), [params]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ Map met open kaarten (per unieke key)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session) router.replace("/opstart/inloggen" as any);
  }, [session]);

  const load = async () => {
    if (!session) return;
    setError(null);

    // 1) check koppeling
    const resConn = await fetch(
      `${BASE_URL}/user/connected/dement/${session.gebruikerid}`,
      { headers: { Accept: "application/json" } }
    );
    const conn = await safeJson(resConn);

    const ok =
      resConn.ok &&
      Array.isArray(conn) &&
      conn.some((x: any) => extractDementId(x) === session.dementgebruikerid);

    if (!ok) {
      router.replace({
        pathname: "/opstart/linken",
        params: { gebruikerid: String(session.gebruikerid) },
      } as any);
      return;
    }

    // 2) logs ophalen
    const res = await fetch(`${BASE_URL}/user/logs/${session.dementgebruikerid}`, {
      headers: { Accept: "application/json" },
    });
    const data = await safeJson(res);

    if (!res.ok) {
      setError("Kon dagboek niet ophalen.");
      setLogs([]);
      return;
    }

    const list = Array.isArray(data) ? data : [];

    // sorteer nieuwste bovenaan
    const sorted = [...list].sort((a: any, b: any) => {
      const da = parseDate(extractDateRaw(a))?.getTime() ?? 0;
      const db = parseDate(extractDateRaw(b))?.getTime() ?? 0;
      if (da !== db) return db - da;

      const ia = toInt(a?.logId ?? a?.id ?? a?.logboekId) ?? 0;
      const ib = toInt(b?.logId ?? b?.id ?? b?.logboekId) ?? 0;
      return ib - ia;
    });

    setLogs(sorted);
    // (optioneel) openMap NIET resetten, zodat open items open blijven na refresh
    // wil je wel resetten? -> setOpenMap({});
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.gebruikerid, session?.dementgebruikerid]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ toggle per unieke key (dus nooit "alles open")
  const toggleOpen = (uniqueKey: string) => {
    setOpenMap((cur) => ({ ...cur, [uniqueKey]: !cur[uniqueKey] }));
  };

  if (!session) return null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 28 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>Dagboek</Text>
        <Text style={styles.h2}>Herinneringen</Text>
      </View>

      {loading ? (
        <View style={{ marginTop: 18 }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Fout</Text>
          <Text style={styles.infoText}>{error}</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Nog geen herinneringen</Text>
          <Text style={styles.infoText}>Er zijn nog geen dagboekitems gevonden.</Text>
        </View>
      ) : (
        logs.map((log, idx) => {
          const id = extractLogId(log, idx);

          // ✅ SUPER BELANGRIJK: unieke sleutel per kaart
          // (id alleen kan bij jou soms identiek zijn, daarom idx erbij)
          const uniqueKey = `${id}-${idx}`;

          const d = parseDate(extractDateRaw(log));
          const dateLabel = d ? formatDateNL(d) : "Onbekende datum";
          const content = extractContent(log);

          const isOpen = !!openMap[uniqueKey];

          return (
            <View key={uniqueKey} style={[styles.card, isOpen && styles.cardOpen]}>
              {/* Datum = NIET klikbaar */}
              <Text style={styles.cardDate}>{dateLabel}</Text>

              {/* Preview of full */}
              <Text style={styles.cardText}>
                {isOpen ? content : previewText(content, 95)}
              </Text>

              {/* Button per kaart */}
              <Pressable
                onPress={() => toggleOpen(uniqueKey)}
                style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.smallBtnText}>{isOpen ? "Sluiten" : "Lees meer"}</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ---------------- styles ----------------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F3EF", padding: 18 },

  header: { alignItems: "center", marginTop: 6, marginBottom: 14 },
  h1: {
    fontSize: 28,
    fontWeight: "900",
    color: PRIMARY,
    textDecorationLine: "underline",
  },
  h2: { marginTop: 6, fontSize: 20, fontWeight: "700", color: SECONDARY },

  infoCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6E3DB",
  },
  infoTitle: { fontSize: 16, fontWeight: "900", color: PRIMARY },
  infoText: { marginTop: 8, color: "#555", fontWeight: "600", lineHeight: 20 },

  card: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.3,
    borderColor: PRIMARY,
  },
  cardOpen: {
    borderColor: ACCENT,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  cardDate: {
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "900",
    color: PRIMARY,
    marginBottom: 12,
  },

  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    lineHeight: 22,
  },

  smallBtn: {
    marginTop: 14,
    alignSelf: "flex-end",
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  smallBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
