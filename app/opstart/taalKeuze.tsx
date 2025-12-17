import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function taalKeuze() {
    return (
        <View style={styles.container}>
            {/* Titelbalk */}
            <View style={styles.header}>
                <Text style={styles.headerText}>My Memori</Text>
            </View>

            {/* Inhoud */}
            <View style={styles.inner}>
                <Text style={styles.title}>Selecteer een taal</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.buttonText}>Nederlands</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.buttonText}>Engels</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.buttonText}>Frans</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/')}
                >

                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    header: {
        width: '100%',
        paddingVertical: 18,
        backgroundColor: '#D3C4F3',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        color: '#3A276A',
        fontSize: 30,
        fontWeight: '600',
    },

    inner: {
        width: '80%',
        paddingVertical: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: '#3A276A',
        marginBottom: 30,
        fontWeight: '600',
    },

    button: {
        backgroundColor: '#8757D8',
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '80%',
        borderRadius: 10,
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
    },
});