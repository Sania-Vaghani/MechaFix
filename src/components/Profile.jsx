import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Profile = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Profile Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FF',
  },
  text: {
    fontSize: 22,
    color: '#22223B',
    fontWeight: 'bold',
  },
});

export default Profile; 