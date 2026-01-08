import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const HandleidingToevoegen = () => {
    const [handleidingnaam, setHandleidingnaam] = useState("");
    const [handleidingbeschrijving, setHandleidingbeschrijving] = useState("");
    const [foto] = useState<string | null>(null);

    const maakHandleiding = () => {
        fetch("http://10.2.160.216:8000/handleiding", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                gebruikersId: 3,
                handleidingnaam,
                handleidingbeschrijving,
                gepint: 0
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                router.push({
                    pathname: "/GelinkteUser/handleidingen/voegStap",
                    params: {
                        handleidingId: data.HandleidingId,
                        handleidingnaam: handleidingnaam
                    }
                });
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleWrapper}>
                <Text style={styles.title}>Handleiding</Text>
            </View>

            <TouchableOpacity style={styles.fotoBox}>
                {foto ? (
                    <Image source={{ uri: foto }} style={styles.foto} />
                ) : (
                    <Text style={styles.fotoText}>Voeg foto toe</Text>
                )}
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Naam van de handleiding"
                value={handleidingnaam}
                onChangeText={setHandleidingnaam}
            />

            <TextInput
                style={styles.input}
                placeholder="Beschrijving van de handleiding"
                value={handleidingbeschrijving}
                onChangeText={setHandleidingbeschrijving}
            />

            <TouchableOpacity
                style={[
                    styles.button,
                    (!handleidingnaam || !handleidingbeschrijving) && styles.buttonDisabled,
                ]}
                onPress={maakHandleiding}
                disabled={!handleidingnaam || !handleidingbeschrijving}
            >
                <Text style={styles.buttonText}>Voeg handleiding toe</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleWrapper: {
        width: '100%',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#3A276A',
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#000',
    },
    fotoBox: {
        height: 180,
        borderWidth: 2,
        borderColor: '#3A276A',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        marginHorizontal: 20,
    },
    foto: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    fotoText: {
        color: '#3A276A',
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 2,
        borderColor: '#3A276A',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 25,
        marginHorizontal: 20,
    },
    button: {
        borderWidth: 2,
        borderColor: '#3A276A',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3A276A',
    },
});

export default HandleidingToevoegen;
