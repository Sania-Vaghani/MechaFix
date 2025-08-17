import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🔄 [LogoutScreen] Performing logout...');
        
        // Clear all storage
        await AsyncStorage.multiRemove([
          'jwtToken', 
          'userType', 
          'userData', 
          'mechanicData',
          'topMechanics'
        ]);
        
        console.log('✅ [LogoutScreen] Storage cleared');
        
        // Navigate to login
        navigation.replace('Login');
        
      } catch (error) {
        console.error('❌ [LogoutScreen] Logout error:', error);
        // Force navigation even if cleanup fails
        navigation.replace('Login');
      }
    };

    performLogout();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LogoutScreen; 