import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Handleiding = {
    handleidingid: number;
    handleidingnaam: string;
    handleidingbeschrijving: string;
    foto: string;
    gepint: number;
};

function AlleHandleidingen() {
    const [handleidingen, setHandleidingen] = useState<Handleiding[]>([]);
    const { dementId } = useLocalSearchParams<{ dementId: string }>();
    const { dementeGebruikerId } = useLocalSearchParams<{ dementeGebruikerId: string }>();
    const { userId } = useLocalSearchParams<{ userId: string }>();

    useEffect(() => {
        fetch("http://10.2.160.216:8000/handleiding/" + dementId)
            .then(res => res.json())
            .then(data => {
                setHandleidingen(Array.isArray(data) ? data : [data])
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Handleidingen</Text>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.lijst}>
                    {handleidingen.map((item) => (
                        <TouchableOpacity
                            key={item.handleidingid}
                            style={styles.images}
                            onPress={() => router.push(`/GelinkteUser/handleidingen/handleiding?id=${item.handleidingid}&handleidingnaam=${item.handleidingnaam}`)}
                        >
                            <Text>{item.handleidingnaam}</Text>
                            <Text>{item.handleidingbeschrijving}</Text>
                        </TouchableOpacity>

                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push(`/GelinkteUser/handleidingen/handleidingToevoegen?dementeGebruikerId=${dementeGebruikerId}&gebruikerId=${userId}`)}
            >
                <Text style={styles.buttonText}>Voeg handleiding toe</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: '#000000ff',
        marginBottom: 30,
        marginTop: 30,
        fontWeight: '600',
        alignSelf: 'flex-start',
        paddingLeft: 30,
    },
    lijst: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
        paddingLeft: 15,
        paddingRight: 15,
    },
    images: {
        width: '48%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignSelf: 'center',
        marginBottom: 10,
        borderColor: '#301A57',
        borderWidth: 2,
        position: 'absolute',
        bottom: 30,
        backgroundColor: '#fff'
    },
    buttonText: {
        color: '#000',
        fontSize: 20,
        fontWeight: "600",
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
        marginBottom: 120,
    },
});

export default AlleHandleidingen;
