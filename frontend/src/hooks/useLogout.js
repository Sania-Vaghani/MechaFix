import { useNavigation } from '@react-navigation/native';
import { useUserType } from '../context/UserTypeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const useLogout = () => {
  const navigation = useNavigation();
  const { clearUserType } = useUserType();

  const handleLogout = async (showConfirmation = true) => {
    console.log('�� [useLogout] handleLogout called');

    const performLogout = async () => {
      try {
        console.log('🔄 [useLogout] Starting logout process...');
        
        // Clear context first
        await clearUserType();
        console.log('✅ [useLogout] Context cleared');
        
        // Navigate to logout screen which will handle the rest
        console.log('🔄 [useLogout] Navigating to Logout screen...');
        navigation.replace('Logout');
        
      } catch (error) {
        console.error('❌ [useLogout] Logout error:', error);
        // Fallback: navigate to logout screen
        navigation.replace('Logout');
      }
    };

    if (showConfirmation) {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to log out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: performLogout },
        ],
        { cancelable: true }
      );
    } else {
      await performLogout();
    }
  };

  return { handleLogout };
}; 