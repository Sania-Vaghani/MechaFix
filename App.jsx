import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import AuthScreen from './src/components/AuthScreen';
import OtpScreen from './src/components/OtpScreen';
import UserSignUp from './src/components/UserSignUp';
import PhoneNum from './src/components/PhoneNum';

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* {isSplashVisible ? <SplashScreen /> : <AuthScreen />} */}
      {/* <OtpScreen/> */}
      {/* <UserSignUp/> */}
      <PhoneNum/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
