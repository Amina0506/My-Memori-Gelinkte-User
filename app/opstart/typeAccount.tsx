import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TypeAccount() {
    return (
        <View style={styles.container}>
            {/* Titelbalk */}
            <View style={styles.header}>
                <Text style={styles.headerText}>My Memori</Text>
            </View>

            {/* Inhoud */}
            <View style={styles.inner}>
                <Text style={styles.title}>Type account</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/opstart/taalKeuze')}
                >
                    <Text style={styles.buttonText}>Ik ben de persoon met dementie</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.buttonText}>Ik ben een zorgverlener</Text>
                </TouchableOpacity>

      
            </View>
<View style={styles.container}>
     
 
      <TouchableOpacity onPress={() => router.push('/GelinkteUser/home')}>
        <Text style={styles.Links}>Ga naar home gelinkte</Text>
      </TouchableOpacity>

           <TouchableOpacity onPress={() => router.push('/GelinkteUser/accountLinken')}>
        <Text style={styles.Links}>Ga naar home</Text>
      </TouchableOpacity>

       <TouchableOpacity onPress={() => router.push('/GelinkteUser/beheren')}>
        <Text style={styles.Links}>Ga naar account beheren</Text>
      </TouchableOpacity>

<TouchableOpacity onPress={() => router.push('/GelinkteUser/profiel/test')}>
        <Text style={styles.Links}>Ga naar profiel</Text>
      </TouchableOpacity>
       <TouchableOpacity onPress={() => router.push('/GelinkteUser/dagboek/test')}>
        <Text style={styles.Links}>Ga naar dagboek </Text>
      </TouchableOpacity>
    <TouchableOpacity onPress={() => router.push('/GelinkteUser/handleidingen/alleHandleidingen')}>
        <Text style={styles.Links}>Ga naar handleidingen</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/GelinkteUser/kalender')}>
        <Text style={styles.Links}>Ga naar kalender</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/GelinkteUser/stamboom/test')}>
        <Text style={styles.Links}>Ga naar stamboom</Text>
      </TouchableOpacity>

       <TouchableOpacity onPress={() => router.push('/GelinkteUser/todoLijst/test')}>
        <Text style={styles.Links}>Ga naar Todolist</Text>
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
Links: {
  color: '#1E90FF',      // blauw zoals een echte link
  fontSize: 16,
  textDecorationLine: 'underline',
  marginTop: 10,
},
});