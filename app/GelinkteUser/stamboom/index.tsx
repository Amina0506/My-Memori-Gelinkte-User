import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { readLinkedSession } from "../../utils/sessionLinked";
 
interface Familieblad {
  familiebladId: number | null;
  familiebladnaam: string | null;
  geboortedatum: string | null;
  sterftedatum: string | null;
  beschrijving: string | null;
  foto: string | null;
  geslacht: number | null;
}
 
interface Familieboom {
  familieboomId: number;
  familieboomnaam: string;
  gebruikerId: number;
  familiebladen: Familieblad[];
}
 
function toInt(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
 
function normalizeFamilieblad(raw: any): Familieblad {
  return {
    familiebladId: toInt(raw?.familiebladId ?? raw?.familiebladid ?? raw?.id),
    familiebladnaam:
      raw?.familiebladnaam ??
      raw?.familiebladNaam ??
      raw?.naam ??
      raw?.familieblad_name ??
      null,
    geboortedatum: raw?.geboortedatum ?? raw?.geboorteDatum ?? raw?.birthdate ?? null,
    sterftedatum: raw?.sterftedatum ?? raw?.sterfteDatum ?? raw?.deathdate ?? null,
    beschrijving: raw?.beschrijving ?? raw?.omschrijving ?? null,
    foto: raw?.foto ?? raw?.image ?? null,
    geslacht: toInt(raw?.geslacht ?? raw?.gender),
  };
}
 
function normalizeFamilieboom(data: any): Familieboom | null {
  if (!data) return null;
  const boom = Array.isArray(data) ? data[0] : data;
  if (!boom) return null;
 
  const familieboomId = toInt(boom?.familieboomId ?? boom?.familieboomid ?? boom?.id);
  if (!familieboomId) return null;
 
  const rawBladen =
    boom?.familiebladen ??
    boom?.familieBladen ??
    boom?.familieblad ??
    boom?.bladen ??
    [];
 
  const familiebladen = Array.isArray(rawBladen) ? rawBladen.map(normalizeFamilieblad) : [];
 
  return {
    familieboomId,
    familieboomnaam: boom?.familieboomnaam ?? boom?.familieboomNaam ?? "Stamboom",
    gebruikerId: toInt(boom?.gebruikerId ?? boom?.gebruikerid) ?? 0,
    familiebladen,
  };
}
 
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: text ? JSON.parse(text) : null, text };
  } catch {
    return { json: null, text };
  }
}
 
async function getFamilieboom(id: number) {
  const res = await fetch(`http://10.2.160.216:8000/user/familieboom/${id}`);
  const { json, text } = await safeJson(res);
 
  console.log("STAMBOOM GET status:", res.status);
  console.log("STAMBOOM GET raw:", text);
 
  return normalizeFamilieboom(json);
}
 
function formatGeslacht(g: number | null) {
  if (g === 1) return "Man";
  if (g === 0) return "Vrouw";
  return "-";
}
 
function NodeCard({
  item,
  onDelete,
}: {
  item: Familieblad;
  onDelete: (id: number) => void;
}) {
  return (
<View style={styles.row}>
<View style={styles.railCol}>
<View style={styles.rail} />
<View style={styles.node} />
</View>
 
      <View style={styles.card}>
<Text style={styles.name}>{item.familiebladnaam ?? "-"}</Text>
 
        <View style={styles.metaRow}>
<Text style={styles.metaLabel}>Geboren:</Text>
<Text style={styles.metaValue}>{item.geboortedatum ?? "-"}</Text>
</View>
 
        <View style={styles.metaRow}>
<Text style={styles.metaLabel}>Overleden:</Text>
<Text style={styles.metaValue}>{item.sterftedatum ?? "-"}</Text>
</View>
 
        <View style={styles.metaRow}>
<Text style={styles.metaLabel}>Geslacht:</Text>
<Text style={styles.metaValue}>{formatGeslacht(item.geslacht)}</Text>
</View>
 
        {item.beschrijving ? <Text style={styles.desc}>{item.beschrijving}</Text> : null}
 
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.85 }]}
          onPress={() => {
            if (item.familiebladId == null) return;
            onDelete(item.familiebladId);
          }}
>
<Text style={styles.deleteText}>Verwijderen</Text>
</Pressable>
</View>
</View>
  );
}
 
export default function StamboomGelinkt() {
  const params = useLocalSearchParams();
  const session = readLinkedSession(params);
  if (!session) return null;
 
  const [boom, setBoom] = useState<Familieboom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 
  const fetchBoom = useCallback(async () => {
    try {
      setLoading(true);
 
      console.log("TRY 1 GET familieboom met dementgebruikerid:", session.dementgebruikerid);
      let b = await getFamilieboom(session.dementgebruikerid);
 
      if (!b) {
        console.log("TRY 2 GET familieboom met gebruikerid:", session.gebruikerid);
        b = await getFamilieboom(session.gebruikerid);
      }
 
      console.log("boom gevonden:", b ? "JA" : "NEE");
      setBoom(b);
    } catch (e) {
      console.error("Fetch boom error:", e);
      setBoom(null);
    } finally {
      setLoading(false);
    }
  }, [session.dementgebruikerid, session.gebruikerid]);
 
  useFocusEffect(
    useCallback(() => {
      fetchBoom();
    }, [fetchBoom])
  );
 
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoom();
    setRefreshing(false);
  };
 
  const familiebladen = useMemo(() => {
    const list = boom?.familiebladen ?? [];
    return list
      .map(normalizeFamilieblad)
      .filter(
        (b) =>
          b.familiebladId !== null &&
          b.familiebladnaam !== null &&
          String(b.familiebladnaam).trim() !== ""
      );
  }, [boom]);
 
  const deletePersoon = (id: number) => {
    Alert.alert("Persoon verwijderen", "Ben je zeker dat je deze persoon wilt verwijderen?", [
      { text: "Annuleren", style: "cancel" },
      {
        text: "Verwijderen",
        style: "destructive",
        onPress: async () => {
          try {
            const url = `http://10.2.160.216:8000/user/familieboom/blad/${id}`;
            console.log("DELETE =>", url);
 
            const res = await fetch(url, { method: "DELETE" });
            const body = await res.text();
 
            console.log("DELETE status:", res.status);
            console.log("DELETE body:", body);
 
            if (!res.ok) {
              Alert.alert("Verwijderen mislukt", `Status: ${res.status}\n${body || "-"}`);
              return;
            }
 
            // direct uit UI halen
            setBoom((prev) =>
              prev
                ? {
                    ...prev,
                    familiebladen: (prev.familiebladen ?? []).filter(
                      (b) => (b.familiebladId ?? -1) !== id
                    ),
                  }
                : prev
            );
 
            await fetchBoom();
          } catch (e: any) {
            console.error("Delete error:", e);
            Alert.alert("Netwerkfout", String(e?.message ?? e));
          }
        },
      },
    ]);
  };
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Stamboom</Text>
 
      {loading ? (
<Text style={styles.info}>Laden...</Text>
      ) : (
<FlatList
          data={familiebladen}
          extraData={familiebladen.length}
          keyExtractor={(item) => String(item.familiebladId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
<Text style={styles.info}>
              Geen personen gevonden.{"\n"}Voeg iemand toe via de knop hieronder.
</Text>
          }
          renderItem={({ item }) => <NodeCard item={item} onDelete={deletePersoon} />}
          contentContainerStyle={{ paddingBottom: 130 }}
        />
      )}
 
      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}
        onPress={() =>
          router.push({
            pathname: "/GelinkteUser/stamboom/toevoegen",
            params: {
              gebruikerid: String(session.gebruikerid),
              dementgebruikerid: String(session.dementgebruikerid),
            },
          } as any)
        }
>
<Text style={styles.addBtnText}>Persoon toevoegen</Text>
</Pressable>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9F4EF" },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 16 },
  info: { fontSize: 16, color: "#444", marginTop: 10, lineHeight: 22 },
 
  row: { flexDirection: "row", alignItems: "stretch", marginBottom: 12 },
  railCol: { width: 26, alignItems: "center", position: "relative" },
  rail: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: "#E6DDD6" },
  node: {
    marginTop: 22,
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
 
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },
 
  name: { fontSize: 18, fontWeight: "900", marginBottom: 10 },
 
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  metaLabel: { width: 80, fontSize: 15, color: "#555", fontWeight: "700" },
  metaValue: { flex: 1, fontSize: 15, color: "#111" },
 
  desc: { fontSize: 15, marginTop: 8, color: "#333", lineHeight: 20 },
 
  deleteBtn: {
    marginTop: 12,
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  deleteText: { color: "#fff", fontWeight: "900" },
 
  addBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 18,
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});