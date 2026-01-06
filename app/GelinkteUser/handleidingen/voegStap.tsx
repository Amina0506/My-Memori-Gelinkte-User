import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Stappen {
    stapnummer: number;
    stapBeschrijving: string;
    foto: string;
}

const VoegStap = () => {
    const router = useRouter();
    const { handleidingnaam } = useLocalSearchParams<{ handleidingnaam: string }>();

    const [stappen, setStappen] = useState<Stappen[]>([]);
    const [nieuweBeschrijving, setNieuweBeschrijving] = useState("");

    const addStap = () => {
        if (!nieuweBeschrijving.trim()) return;

        const nieuweStap: Stappen = {
            stapnummer: stappen.length + 1,
            stapBeschrijving: nieuweBeschrijving,
            foto: "",
        };

        setStappen([...stappen, nieuweStap]);
        setNieuweBeschrijving("");
    };

    //Stap verwijderen
    const deleteStap = (index: number) => {
        const nieuweStappen = stappen
            //houd alles behalve het element die we niet gebruiken
            .filter((_, i) => i !== index)
            //stappen blijven juist genummerd
            .map((stap, i) => ({
                ...stap,
                stapnummer: i + 1,
            }));

        setStappen(nieuweStappen);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 220 }}>
                <View style={styles.titleWrapper}>
                    <Text style={styles.title}>Handleiding</Text>
                </View>

                <Text style={styles.handleidingTitel}>{handleidingnaam}</Text>

                {stappen.map((stap, index) => (
                    <View key={stap.stapnummer} style={styles.stappenContainer}>
                        <View style={styles.stapHeader}>
                            <Text style={styles.stap}>Stap {stap.stapnummer}</Text>

                            <TouchableOpacity onPress={() => deleteStap(index)}>
                                <Text style={styles.verwijderStap}>Verwijder stap</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.beschrijving}>{stap.stapBeschrijving}</Text>

                        {stap.foto ? (
                            <Image source={{ uri: stap.foto }} style={styles.foto} />
                        ) : (
                            <View style={[styles.foto, styles.fotoPlaceholder]}>
                                <Text>Voeg foto toe</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.voegstapContainer}>
                <TextInput
                    style={styles.input}
                    value={nieuweBeschrijving}
                    onChangeText={setNieuweBeschrijving}
                    placeholder="Voeg nieuwe stap..."
                />

                <TouchableOpacity style={styles.button} onPress={addStap}>
                    <Text style={styles.buttonText}>Nieuwe stap</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Voeg handleiding toe</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleWrapper: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#3A276A',
        paddingVertical: 15,
        alignItems: 'center',
        marginVertical: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
    },
    handleidingTitel: {
        fontSize: 20,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#3A276A',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 30,
    },
    stappenContainer: {
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        borderRadius: 5,
        backgroundColor: '#D9D9D9',
        padding: 15,
    },
    stap: {
        fontSize: 24,
        fontWeight: '600',
    },
    beschrijving: {
        paddingTop: 10,
        fontSize: 18,
    },
    foto: {
        height: 120,
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: '#eee',
    },
    fotoPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    voegstapContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        borderWidth: 1,
        borderColor: '#3A276A',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#3A276A',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    stapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    verwijderStap: {
        fontWeight: "600",
        marginBottom: 10,
        backgroundColor: "#C62828",
        color: "#fff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
});


export default VoegStap;
