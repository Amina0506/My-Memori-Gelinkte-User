import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HandleidingType {
    handleidingnaam: string;
    handleidingbeschrijving: string;
    foto: string;
    gepint: number;
}
interface StapType {
    stapnummer: number;
    stapBeschrijving: string;
    foto: string;
}

const Handleiding = () => {
    const scrollRef = useRef<ScrollView | null>(null);
    const [handleidingen, setHandleidingen] = useState<HandleidingType[]>([]);
    const [stappen, setStappen] = useState<StapType[]>([]);

    //data ophalen
    useEffect(() => {
        //handleidingen
        fetch("http://10.2.160.216:8000/user/handleiding/3")
            .then(res => res.json())
            .then((data: HandleidingType[]) => setHandleidingen(data))
            .catch(err => console.error(err));

        //stappen
        fetch("http://10.2.160.216:8000/user/handleiding/stappen/1")
            .then(res => res.json())
            .then((data: StapType[]) => setStappen(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <View style={styles.container}>
            {/**header met titel van de handleiding en 'bewerken' knop */}
            {handleidingen.map((item, index) => (
                <View key={index} style={styles.titleContainer}>
                    <Text style={styles.title}>{item.handleidingnaam}</Text>
                    <TouchableOpacity onPress={() => router.push("/GelinkteUser/handleidingen/handleidingBewerken")}>
                        <Text style={styles.bewerkKnop}>Bewerken</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {/**kaarten met stappen */}
            <ScrollView ref={scrollRef} style={styles.scroll} >
                {stappen.map((stap, index) => (
                    <View key={index} style={styles.stap}>
                        <View style={styles.stapLinks}>
                            <Text style={styles.stapTitel}>Stap {stap.stapnummer}</Text>
                            <Text style={styles.stapDescription}>{stap.stapBeschrijving}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
        color: '#000',
        marginBottom: 30,
        marginTop: 30,
        fontWeight: '600',
        alignSelf: 'flex-start',
        paddingLeft: 30,
    },
    stap: {
        borderColor: '#D9D9D9',
        borderWidth: 2,
        borderRadius: 6,
        backgroundColor: '#D9D9D9',
        padding: 14,
        width: '100%',
        height: 200,
        marginBottom: 15,
    },
    stapLinks: {
        flex: 1,
    },
    stapTitel: {
        fontSize: 22,
        color: '#000',
        fontWeight: '600',
        marginBottom: 10,
    },
    stapDescription: {
        fontSize: 15,
        paddingRight: 15,
    },
    scroll: {
        width: '90%'
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 30,
    },
    bewerkKnop: {
        fontSize: 16,
        color: '#3A276A',
        fontWeight: '600',
    },
});

export default Handleiding;
