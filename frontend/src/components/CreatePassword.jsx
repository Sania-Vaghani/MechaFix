import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import padlockIcon from '../images/padlock.png';
import visibleIcon from '../images/visible.png';
import hiddenIcon from '../images/hidden.png';
import arrowIcon from '../images/arrow.png';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const getSignupInfo = async () => {
  const signupInfo = await AsyncStorage.getItem('signupInfo');
  return JSON.parse(signupInfo);
};

const CreatePassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [buttonAnim] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  // const handleContinue = () => {
  //   Animated.sequence([
  //     Animated.timing(buttonAnim, {
  //       toValue: 0.95,
  //       duration: 80,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(buttonAnim, {
  //       toValue: 1,
  //       duration: 80,
  //       useNativeDriver: true,
  //     }),
  //   ]).start(() => {
  //     // Navigate to next step or complete sign up
  //     // navigation.navigate('NextScreen');
  //   });
  // };

  const handleCreatePassword = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const signupInfo = await getSignupInfo();
    try {
      console.log('signupInfo:', signupInfo);
      console.log('password:', password);
      const response = await axios.post('http://10.0.2.2:8000/api/users/create-password/', {
        ...signupInfo, // includes username, email, phone, user_type
        password,
      });
      console.log('Create password response:', response);
      alert('Password set successfully! You can now log in.');
      navigation.navigate('Login');
    } catch (error) { 
      console.log('Create password error:', error);
      alert(error.response?.data?.error || 'Failed to set password');
    }
  };

  return (
    <LinearGradient
      colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative Dots in Gradient Background */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <View style={{ position: 'absolute', top: 40, left: 30, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E53935', opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: 120, right: 40, width: 22, height: 22, borderRadius: 11, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 80, left: 60, width: 16, height: 16, borderRadius: 8, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 140, right: 20, width: 24, height: 24, borderRadius: 12, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 200, left: 100, width: 14, height: 14, borderRadius: 7, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 260, right: 80, width: 19, height: 19, borderRadius: 9.5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', bottom: 200, left: 120, width: 20, height: 20, borderRadius: 10, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 40, right: 100, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 320, left: 180, width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 260, right: 140, width: 21, height: 21, borderRadius: 10.5, backgroundColor: '#E53935', opacity: 0.21 }} />
        <View style={{ position: 'absolute', top: 80, left: 200, width: 12, height: 12, borderRadius: 6, backgroundColor: '#a1c4fd', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 180, right: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#a1c4fd', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 120, left: 180, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E53935', opacity: 0.18 }} />
        <View style={{ position: 'absolute', bottom: 40, left: 20, width: 10, height: 10, borderRadius: 5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', top: 360, right: 60, width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 20, right: 120, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', bottom: 320, left: 60, width: 14, height: 14, borderRadius: 7, backgroundColor: '#a1c4fd', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 180, right: 200, width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        {/* 10 more small dots for vibrancy */}
        <View style={{ position: 'absolute', top: 30, left: 60, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#E53935', opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: 60, left: 120, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 90, left: 180, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', top: 120, left: 240, width: 4, height: 4, borderRadius: 2, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 150, left: 300, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 180, left: 60, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', top: 210, left: 120, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', top: 240, left: 180, width: 4, height: 4, borderRadius: 2, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 270, left: 240, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', top: 300, left: 300, width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935', opacity: 0.20 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* MechaFix Logo at the very top */}
        <View style={[styles.logoTopContainer, { flexDirection: 'row', justifyContent: 'center' }]}> 
          <View style={styles.logoTopBox}>
            <CustomText style={styles.logoTopText}>M</CustomText>
          </View>
          <CustomText style={styles.logoTopBrand}>MechaFix</CustomText>
        </View>
        {/* Arrow Image */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 56, left: 20, zIndex: 20 }}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Image source={arrowIcon} style={{ width: 26, height: 26, resizeMode: 'contain' }} />
        </TouchableOpacity>
        {/* Overlapping Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <CustomText style={styles.title}>Create Password</CustomText>
            <CustomText style={styles.subtitle}>Set a password for your account</CustomText>
            <View style={styles.inputRow}>
              <Image source={padlockIcon} style={styles.inputImgIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                <Image source={showPassword ? visibleIcon : hiddenIcon} style={styles.inputImgIcon} />
              </TouchableOpacity>
            </View>
            {/* Confirm Password Field */}
            <View style={styles.inputRow}>
              <Image source={padlockIcon} style={styles.inputImgIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#9E9E9E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                <Image source={showConfirmPassword ? visibleIcon : hiddenIcon} style={styles.inputImgIcon} />
              </TouchableOpacity>
            </View>
            <Animated.View style={{ transform: [{ scale: buttonAnim }], width: '100%' }}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreatePassword} activeOpacity={0.85}>
                <CustomText style={styles.primaryButtonText}>Continue</CustomText>
              </TouchableOpacity>
            </Animated.View>
            {/* Add spacing between button and car illustration */}
            <View style={{ height: 28 }} />
            {/* Car Illustration (copied and adapted from OtpScreen) */}
            <View style={styles.cpCardIllustrationContainer}>
              {/* Buildings */}
              <View style={styles.cpCardBuildingsRow}>
                <View style={styles.cpCardBuildingBlock}>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                </View>
                <View style={[styles.cpCardBuildingBlock, { height: 40, backgroundColor: '#e0e0e0', marginLeft: 8 }]}> 
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
                      <View style={[styles.cpCardWindow, { width: 10, height: 9 }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
                      <View style={[styles.cpCardWindow, { width: 10, height: 9 }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <View style={[styles.cpCardWindow, { width: 10, height: 9 }]} />
                    </View>
                  </View>
                </View>
                <View style={[styles.cpCardBuildingBlock, { height: 58, backgroundColor: '#e6e6e6', marginLeft: 8 }]}> 
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                  <View style={styles.cpCardWindowRow}>
                    <View style={styles.cpCardWindow} />
                    <View style={styles.cpCardWindow} />
                  </View>
                </View>
              </View>
              {/* Car */}
              <View style={styles.cpCardCar}>
                <View style={styles.cpCardCarBody} />
                <View style={styles.cpCardCarRoof}>
                  <View style={styles.cpCardCarWindow} />
                  <View style={[styles.cpCardCarWindow, { left: 33 }]} />
                </View>
                <View style={styles.cpCardWheelContainer}>
                  <View style={styles.cpCardWheel} />
                  <View style={styles.cpCardWheel} />
                </View>
              </View>
              {/* Road */}
              <View style={styles.cpCardRoad} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTopContainer: {
    position: 'absolute',
    top: 95,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoTopBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  logoTopText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  logoTopBrand: {
    color: '#333',
    fontSize: 40,
    fontFamily: 'Cormorant-Bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  cardWrapper: {
    width: '90%',
    alignItems: 'center',
    marginTop: 60,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 18,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minHeight: 220,
    width: 360,
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E53935',
    paddingHorizontal: 10,
    height: 46,
    width: '100%',
  },
  inputImgIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontFamily: 'Poppins',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  primaryButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 180,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  // --- OTP-style illustration styles for CreatePassword ---
  cpCardIllustrationContainer: {
    width: '100%',
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  cpCardBuildingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 140,
    marginBottom: 12,
  },
  cpCardBuildingBlock: {
    width: 36,
    height: 60,
    backgroundColor: '#eaeaea',
    borderRadius: 4,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  cpCardWindowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
  },
  cpCardWindow: {
    width: 5,
    height: 10,
    backgroundColor: '#87cefa',
    borderRadius: 0,
    marginHorizontal: 1,
  },
  cpCardCar: {
    width: 90,
    height: 48,
    zIndex: 1,
    position: 'relative',
    marginTop: -12,
    alignSelf: 'center',
  },
  cpCardCarBody: {
    position: 'absolute',
    bottom: 10,
    width: 90,
    height: 24,
    backgroundColor: '#D9534F',
    borderRadius: 4,
  },
  cpCardCarRoof: {
    position: 'absolute',
    top: 0,
    left: 15,
    width: 60,
    height: 18,
    backgroundColor: '#9C9C9C',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cpCardCarWindow: {
    position: 'absolute',
    top: 3,
    left: 6,
    width: 20,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    opacity: 0.85,
    borderWidth: 1,
    borderColor: '#e3f0ff',
  },
  cpCardWheelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cpCardWheel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  cpCardRoad: {
    width: 140,
    height: 20,
    backgroundColor: '#bbb',
    borderRadius: 4,
    marginTop: 1,
    marginBottom: 2,
    alignSelf: 'center',
  },
});

export default CreatePassword; 