import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface HandleidingType {
    handleidingnaam: string;
    handleidingbeschrijving: string;
    foto: string;
    gepint: number;
}

interface Stappen {
    handleidingstapId: number;
    stapnummer: number;
    beschrijving: string;
    foto: string;
}

const Handleiding = () => {
    const [handleiding, setHandleiding] = useState<HandleidingType | null>(null);
    const [stappen, setStappen] = useState<Stappen[]>([]);
    const { id } = useLocalSearchParams<{ id: string }>();
    const { handleidingnaam } = useLocalSearchParams<{ handleidingnaam: string }>();

    const baseUrl = useMemo(() => "http://10.2.160.216:8000", []);

    useEffect(() => {
        if (!id) return;

        if (!handleidingnaam)

            // handleiding ophalen
            fetch(`${baseUrl}/handleiding/${id}`)
                .then((res) => res.json())
                .then((data: HandleidingType) => setHandleiding(data))
                .catch((err) => console.error(err));

        // stappen ophalen
        fetch(`${baseUrl}/handleiding/stappen/${id}`)
            .then((res) => res.json())
            .then((data: Stappen[]) => setStappen(data))
            .catch((err) => console.error(err));
    }, [id, baseUrl]);


    const updateStap = (
        index: number,
        field: keyof Stappen,
        value: string | number
    ) => {
        setStappen((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value } as Stappen;
            return copy;
        });
    };

    const addStap = () => {
        setStappen((prev) => {
            const maxNum = prev.reduce((m, s) => Math.max(m, s.stapnummer || 0), 0);
            const nextNum = maxNum + 1;

            const newStap: Stappen = {
                handleidingstapId: 0,
                stapnummer: nextNum,
                beschrijving: "",
                foto: "",
            };

            fetch("http://10.2.160.216:8000/handleiding/stappen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    handleidingId: id,
                    handleidingstapId: 0,
                    stapnummer: nextNum,
                    beschrijving: " ",
                    foto: "",
                }),
            });


            return [...prev, newStap];
        });
    };

    const saveChanges = async (stap: Stappen) => {
        try {
            if (!id) return;

            const stappenResponse = await fetch(`${baseUrl}/handleiding/stap/${stap.handleidingstapId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stap),
            });
            if (!stappenResponse.ok) {
                const txt = await stappenResponse.text().catch(() => "");
                throw new Error(`Stappen PATCH mislukt: ${stappenResponse.status} ${txt}`);
            }

            fetch(`${baseUrl}/handleiding/stappen/${id}`)
                .then((res) => res.json())
                .then((data: Stappen[]) => setStappen(data))
                .catch((err) => console.error(err));

            // handleiding opslaan
            if (handleiding) {
                const handleidingResponse = await fetch(`${baseUrl}/handleiding/stappen/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(handleiding),
                });

                if (!handleidingResponse.ok) {
                    const txt = await handleidingResponse.text().catch(() => "");
                    throw new Error(`Handleiding PATCH mislukt: ${handleidingResponse.status} ${txt}`);
                }

                const updatedHandleiding: HandleidingType = await handleidingResponse.json();
                setHandleiding(updatedHandleiding);
            }

            Alert.alert("Succes", "De wijzigingen zijn opgeslagen!");
        } catch (error) {
            console.error(error);
            Alert.alert("Fout", "Er is iets misgegaan bij het opslaan.");
        }
    };

    const deleteStap = async (handleidingstapId: number) => {
        try {
            // interface wordt geupdatet
            setStappen((prev) => prev.filter((s) => s.handleidingstapId !== handleidingstapId));

            if (!handleidingstapId || handleidingstapId === 0) return;

            const res = await fetch(`${baseUrl}/handleiding/stap/${handleidingstapId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`DELETE mislukt: ${res.status} ${txt}`);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Fout", "Verwijderen is mislukt.");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>


                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{handleidingnaam}</Text>
                </View>


                {stappen.map((stap, index) => (
                    <View key={`${stap.handleidingstapId}-${index}`} style={styles.stap}>
                        <View style={styles.stapLinks}>
                            <View style={styles.stapHeader}>
                                <Text style={styles.stapTitel}>Stap {stap.stapnummer}</Text>
                            </View>

                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                value={stap.beschrijving}
                                multiline
                                onChangeText={(text) => updateStap(index, "beschrijving", text)}
                                placeholder="Beschrijf de stap..."
                            />

                            <TouchableOpacity style={styles.saveButton} onPress={() => saveChanges(stap)}>
                                <Text style={styles.saveButtonText}>Opslaan</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.verwijderStap} onPress={() => deleteStap(stap.handleidingstapId)}>
                                <Text style={styles.verwijderStapText}>Verwijder stap</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/*knop om stap toe te voegen*/}
            <TouchableOpacity style={styles.addButton} onPress={addStap}>
                <Text style={styles.addButtonText}>Stap toevoegen</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        color: "#000",
        marginBottom: 30,
        marginTop: 30,
        fontWeight: "600",
        alignSelf: "flex-start",
    },
    stap: {
        borderColor: "#D9D9D9",
        borderWidth: 2,
        borderRadius: 6,
        backgroundColor: "#D9D9D9",
        padding: 14,
        width: "100%",
        marginBottom: 15,
    },
    stapLinks: {
        flex: 1,
    },
    stapTitel: {
        fontSize: 22,
        color: "#000",
        fontWeight: "600",
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        fontSize: 15,
    },
    scroll: {
        width: "90%",
        marginBottom: 20,
        marginTop: 50
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 30,
    },
    saveButton: {
        backgroundColor: "#3A276A",
        fontWeight: "600",
        marginBottom: 10,
        color: "#fff",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        alignSelf: 'center'
    },
    stapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    verwijderStap: {
        marginBottom: 10,
        backgroundColor: "#C62828",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    verwijderStapText: {
        alignSelf: 'center',
        fontWeight: "600",
        color: "#fff",
    },
    addButton: {
        backgroundColor: "#3A276A",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 10,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        paddingHorizontal: 10,
    }
});

export default Handleiding;