import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationCount, setInitializationCount] = useState(0);

  // Initialize userType from AsyncStorage when app starts
  useEffect(() => {
    const initializeUserType = async () => {
      console.log('🔄 [UserTypeContext] Starting initialization...');
      setInitializationCount(prev => prev + 1);
      
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        const token = await AsyncStorage.getItem('jwtToken');
        
        console.log('📱 [UserTypeContext] AsyncStorage values:', {
          storedUserType,
          token: token ? 'EXISTS' : 'NULL',
          tokenLength: token?.length || 0
        });
        
        // Only set userType if both token and userType exist
        if (token && storedUserType) {
          console.log('✅ [UserTypeContext] Setting userType to:', storedUserType);
          setUserType(storedUserType);
        } else {
          console.log('⚠️ [UserTypeContext] Missing token or userType, setting to null');
          setUserType(null);
        }
      } catch (error) {
        console.error('❌ [UserTypeContext] Error initializing:', error);
        setUserType(null);
      } finally {
        console.log('🏁 [UserTypeContext] Initialization complete. isLoading: false');
        setIsLoading(false);
      }
    };

    initializeUserType();
  }, []);

  const updateUserType = async (newUserType) => {
    console.log('🔄 [UserTypeContext] updateUserType called with:', newUserType);
    try {
      await AsyncStorage.setItem('userType', newUserType);
      console.log('✅ [UserTypeContext] userType updated in AsyncStorage');
      setUserType(newUserType);
    } catch (error) {
      console.error('❌ [UserTypeContext] Error updating userType:', error);
    }
  };

  const clearUserType = async () => {
    console.log('🔄 [UserTypeContext] clearUserType called');
    try {
      await AsyncStorage.multiRemove(['userType', 'jwtToken']);
      console.log('✅ [UserTypeContext] AsyncStorage cleared');
      setUserType(null);
    } catch (error) {
      console.error('❌ [UserTypeContext] Error clearing userType:', error);
    }
  };

  console.log('🔄 [UserTypeContext] Render - userType:', userType, 'isLoading:', isLoading);

  return (
    <UserTypeContext.Provider value={{ 
      userType, 
      setUserType: updateUserType, 
      clearUserType,
      isLoading,
      initializationCount
    }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
}; 