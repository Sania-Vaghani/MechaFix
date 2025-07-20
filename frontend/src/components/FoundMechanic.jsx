import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const FoundMechanic = ({ route, navigation }) => {
  const { mechanics } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Found Mechanics</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mechanics && mechanics.length > 0 ? (
          mechanics.map((mech, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.mechName}>{mech.mech_name}</Text>
              <Text style={styles.detail}>Rating: {mech.rating}</Text>
              <Text style={styles.detail}>Distance: {mech.road_distance_km?.toFixed(2)} km</Text>
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => {
                  // Add logic to send request to this mechanic if needed
                  Alert.alert("Request Sent", `Request sent to ${mech.mech_name}`);
                }}
              >
                <Text style={styles.sendBtnText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noMechanics}>No mechanics found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7cac9',
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    color: '#FF4D4F',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '90%',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  mechName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    color: '#444',
    marginBottom: 2,
  },
  sendBtn: {
    backgroundColor: '#ff5c5c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMechanics: {
    fontSize: 18,
    color: '#888',
    marginTop: 40,
  },
});

export default FoundMechanic;
