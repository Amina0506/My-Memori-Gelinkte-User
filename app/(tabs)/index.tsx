import { router } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EersteOpstart() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}></Text>
      </View>

      {/* Titel */}
      <Text style={styles.title}>My Memori</Text>

      {/* Terms of service tekst */}
      <Text style={styles.termsText}>
        Gelieve de{' '}
        <Text
          style={styles.linkText}
          onPress={() =>
            Linking.openURL('https://your-terms-of-service-link-here.com')
          }
        >
          terms of service
        </Text>{' '}
        te lezen en te accepteren
      </Text>

      {/* Accepteren en doorgaan als link */}
      <TouchableOpacity onPress={() => router.push('/opstart/typeAccount')}>
        <Text style={styles.acceptLink}>Accepteren en doorgaan</Text>
      </TouchableOpacity>

      {/* Link onder de accepteren */}
      <Text
        style={styles.underButtonLink}
        onPress={() => router.push('/')}
      >
        Ga naar de home pagina
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 130,
    color: '#998FC7',
  },
  title: {
    fontSize: 32,
    color: '#301A57',
    marginBottom: 12,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 11,
    color: '#7A7A7A',
    marginBottom: 40,
    textAlign: 'center',
  },
  linkText: {
    color: '#6B4EFF',
    textDecorationLine: 'underline',
  },
  acceptLink: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textDecorationLine: 'underline',
  },
  underButtonLink: {
    color: '#6B4EFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
