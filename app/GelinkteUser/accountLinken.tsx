import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AccountLinken() {
  const [dementId, setDementId] = useState("");
  const [relatie, setRelatie] = useState("");
  const [loading, setLoading] = useState(false);

  //  tijdelijk – later uit login / auth halen
  const LINKED_ID = 3;

  const linkAanvragen = async () => {
    if (!dementId || !relatie) {
      Alert.alert("Fout", "Vul alle velden in");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://10.2.160.216:8000/user/link-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dement_id: Number(dementId),
            linked_id: LINKED_ID,
            relatie: relatie,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Link aanvragen mislukt");
      }

      Alert.alert(
        "Aanvraag verstuurd",
        "De gebruiker moet de link nog accepteren."
      );

      router.back();
    } catch (err) {
      Alert.alert("Fout", "Er ging iets mis bij het aanvragen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nieuw account linken</Text>

      <Text style={styles.label}>Account ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Vul hier het account ID in"
        keyboardType="numeric"
        value={dementId}
        onChangeText={setDementId}
      />

      <Text style={styles.label}>Wie ben je?</Text>
      <TextInput
        style={styles.input}
        placeholder="bv. zus, zoon, partner"
        value={relatie}
        onChangeText={setRelatie}
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Annuleren</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.confirm,
            loading && { opacity: 0.6 },
          ]}
          onPress={linkAanvragen}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Link aanvragen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  confirm: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
  },
});
