import { router } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface HandleidingType {
    handleidingnaam: string;
    handleidingbeschrijving: string;
    foto: string;
    gepint: number;
}

interface Stappen {
    stapnummer: number;
    stapBeschrijving: string;
    foto: string;
}

const Handleiding = () => {
    const scrollRef = useRef<ScrollView | null>(null);
    const [handleidingen, setHandleidingen] = useState<HandleidingType[]>([]);
    const [stappen, setStappen] = useState<Stappen[]>([]);

    useEffect(() => {
        //handleidingen
        fetch("http://10.2.160.216:8000/user/handleiding/3")
            .then(res => res.json())
            .then((data: HandleidingType[]) => setHandleidingen(data))
            .catch(err => console.error(err));

        //stappen
        fetch("http://10.2.160.216:8000/user/handleiding/stappen/1")
            .then(res => res.json())
            .then((data: Stappen[]) => setStappen(data))
            .catch(err => console.error(err));
    }, []);

    const updateStap = (index: number, field: keyof Stappen, value: string | number) => {
        const newStappen = [...stappen];
        newStappen[index] = { ...newStappen[index], [field]: value };
        setStappen(newStappen);
    };

    const saveChanges = async () => {
        try {
            //stappen opslaan
            const stappenResponse = await fetch('http://10.2.160.216:8000/user/handleiding/stappen/1', {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stappen),
            });
            const updatedStappen: Stappen[] = await stappenResponse.json();
            setStappen(updatedStappen);

            //handleiding opslaan
            const handleidingResponse = await fetch('http://10.2.160.216:8000/user/handleiding/3', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(handleidingen),
            });
            const updatedHandleiding: HandleidingType[] = await handleidingResponse.json();
            setHandleidingen(updatedHandleiding);

            Alert.alert('Succes', 'De wijzigingen zijn opgeslagen!');
        } catch (error) {
            console.error(error);
            Alert.alert('Fout', 'Er is iets misgegaan bij het opslaan.');
        }
    };

    return (
        <View style={styles.container}>
            {handleidingen.map((item, index) => (
                <View key={index} style={styles.titleContainer}>
                    <Text style={styles.title}>{item.handleidingnaam}</Text>
                    <TouchableOpacity onPress={() => router.push("/GelinkteUser/handleidingen/handleidingBewerken")}>
                        <Text style={styles.bewerkKnop}>Bewerken</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <ScrollView ref={scrollRef} style={styles.scroll}>
                {stappen.map((stap, index) => (
                    <View
                        key={index}
                        style={styles.stap}
                    >
                        <View style={styles.stapLinks}>
                            <Text style={styles.stapTitel}>Stap {stap.stapnummer}</Text>

                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                value={stap.stapBeschrijving}
                                multiline
                                onChangeText={text => updateStap(index, 'stapBeschrijving', text)}
                            />

                        
                        </View>
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Opslaan</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingBottom: 20,
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
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        fontSize: 15,
    },
    scroll: {
        width: '90%',
        marginBottom: 20,
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
    saveButton: {
        backgroundColor: '#3A276A',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Handleiding;
