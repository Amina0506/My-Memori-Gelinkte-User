import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Handleiding = {
    handleidingnaam: string;
    handleidingbeschrijving: string;
    foto: string;
    gepint: number;
};

function AlleHandleidingen() {
    const [handleidingen, setHandleidingen] = useState<Handleiding[]>([]);

    useEffect(() => {
        fetch("http://10.2.160.216:8000/user/handleiding/3")
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setHandleidingen(data);
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);


    return (
        <View style={styles.container}>

            <Text style={styles.title}>Handleidingen</Text>
            <View style={styles.lijst}>
                {handleidingen.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.images}
                            onPress={() => router.push(`/GelinkteUser/handleidingen/handleiding`)}>
                            <Text>{item.handleidingnaam}</Text>
                            <Text>{item.handleidingbeschrijving}</Text>
                        </TouchableOpacity>
                    ))}
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/GelinkteUser/handleidingen/handleidingToevoegen")}
            >
                <Text style={styles.buttonText}>Voeg handleiding toe</Text>
            </TouchableOpacity>

        </View>
    )
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
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 20,
        borderColor: '#301A57',
        borderWidth: 2,
        position: 'absolute',
        bottom: 30,
    },
    buttonText: {
        color: '#000',
        fontSize: 20,
        fontWeight: "600",
    },

})

export default AlleHandleidingen;
