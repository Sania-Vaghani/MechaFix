import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  Button,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import arrowIcon from '../images/arrow.png'; // Adjust the path if needed

const OtpScreen = ({ route }) => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const { email } = route.params || {};

  // If email is missing, show a message and do not render OTP input
  if (!email) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No email provided. Please go back and try again.</Text>
      </View>
    );
  }

  const handleChange = (text, idx) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < 3) {
        inputs[idx + 1].current.focus();
      }
      if (!text && idx > 0) {
        inputs[idx - 1].current.focus();
      }
    }
  };

  const handleFocus = idx => {
    setFocusedIdx(idx);
  };

  const handleBlur = idx => {
    setFocusedIdx(-1);
  };

  const getInputBorderColor = idx => '#E53935';

  const handleContinue = async () => {
    try {
      const enteredOtp = otp.join('');
      const response = await axios.post('http://10.0.2.2:8000/api/users/verify-otp/', {
        email,
        otp: enteredOtp, // <-- send as string!
      });
      // Only navigate if verification is successful
      navigation.navigate('CreatePassword', { email });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      const info = await AsyncStorage.getItem('signupInfo');
      if (!info) {
        Alert.alert('Error', 'Signup info not found. Please sign up again.');
        return;
      }
      const { username, email, phone, user_type } = JSON.parse(info);
      await axios.post('http://10.0.2.2:8000/api/users/signup/', {
        username,
        email,
        phone,
        user_type,
      });
      setOtp(['', '', '', '']); // Clear OTP input fields
      Alert.alert('Success', 'A new OTP has been sent to your email!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <LinearGradient
      colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Back Arrow */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 56, left: 20, zIndex: 20 }}
        onPress={() => navigation.navigate('SignUp')}
        activeOpacity={0.7}
      >
        <Image source={arrowIcon} style={{ width: 26, height: 26, resizeMode: 'contain' }} />
      </TouchableOpacity>
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
        {/* 30 more small dots for vibrancy */}
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
        <View style={{ position: 'absolute', bottom: 30, right: 60, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 60, right: 120, width: 4, height: 4, borderRadius: 2, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 90, right: 180, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', bottom: 120, right: 240, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 150, right: 300, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', bottom: 180, right: 60, width: 4, height: 4, borderRadius: 2, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 210, right: 120, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 240, right: 180, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 270, right: 240, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', bottom: 300, right: 300, width: 4, height: 4, borderRadius: 2, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 50, right: 50, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', top: 100, right: 100, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 150, right: 150, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 200, right: 200, width: 4, height: 4, borderRadius: 2, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', top: 250, right: 250, width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', bottom: 50, left: 50, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 100, left: 100, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', bottom: 150, left: 150, width: 4, height: 4, borderRadius: 2, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 200, left: 200, width: 6, height: 6, borderRadius: 3, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 250, left: 250, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 300, left: 300, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E53935', opacity: 0.20 }} />
        {/* Dots cluster at the bottom where blue gradient is visible */}
        <View style={{ position: 'absolute', bottom: 30, left: 30, width: 10, height: 10, borderRadius: 5, backgroundColor: '#a1c4fd', opacity: 0.35 }} />
        <View style={{ position: 'absolute', bottom: 50, left: 80, width: 8, height: 8, borderRadius: 4, backgroundColor: '#87cefa', opacity: 0.32 }} />
        <View style={{ position: 'absolute', bottom: 40, left: 140, width: 12, height: 12, borderRadius: 6, backgroundColor: '#e3f0ff', opacity: 0.28 }} />
        <View style={{ position: 'absolute', bottom: 60, left: 200, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#a1c4fd', opacity: 0.33 }} />
        <View style={{ position: 'absolute', bottom: 35, right: 40, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#87cefa', opacity: 0.30 }} />
        <View style={{ position: 'absolute', bottom: 55, right: 90, width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#e3f0ff', opacity: 0.27 }} />
        <View style={{ position: 'absolute', bottom: 25, right: 120, width: 8, height: 8, borderRadius: 4, backgroundColor: '#a1c4fd', opacity: 0.34 }} />
        <View style={{ position: 'absolute', bottom: 45, right: 180, width: 10, height: 10, borderRadius: 5, backgroundColor: '#87cefa', opacity: 0.31 }} />
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* Decorative Illustration */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0, marginBottom: 40 }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#D9534F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <CustomText style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', fontFamily: 'Poppins' }}>M</CustomText>
          </View>
          <CustomText style={{ fontSize: 40, color: '#333', fontFamily: 'Cormorant-Bold', letterSpacing: 1 }}>MechaFix</CustomText>
        </View>
        {/* Add spacing between logo and illustration */}
        <View style={{ height: 10 }} />
        {/* Static Card (no animation) */}
        <View style={styles.card}>
          {/* Static Car with Building Illustration */}
          <View style={styles.otpCardIllustrationContainer}>
            {/* Buildings (multiple blocks with windows) */}
            <View style={styles.otpCardBuildingsRow}>
              <View style={styles.otpCardBuildingBlock}>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
              </View>
              <View style={[styles.otpCardBuildingBlock, { height: 40, backgroundColor: '#e0e0e0', marginLeft: 8 }]}> 
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
                    <View style={[styles.otpCardWindow, { width: 10, height: 9, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
                    <View style={[styles.otpCardWindow, { width: 10, height: 9, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={[styles.otpCardWindow, { width: 10, height: 9, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  </View>
                </View>
              </View>
              <View style={[styles.otpCardBuildingBlock, { height: 58, backgroundColor: '#e6e6e6', marginLeft: 8 }]}> 
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
                <View style={styles.otpCardWindowRow}>
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                  <View style={[styles.otpCardWindow, { width: 5, height: 10, backgroundColor: '#87cefa', borderRadius: 0 }]} />
                </View>
              </View>
            </View>
            {/* Car */}
            <View style={styles.otpCardCar}>
              <View style={styles.otpCardCarBody} />
              <View style={styles.otpCardCarRoof}>
                <View style={styles.otpCardCarWindow} />
                <View style={[styles.otpCardCarWindow,{left:33}]} />
              </View>
              <View style={styles.otpCardWheelContainer}>
                <View style={styles.otpCardWheel} />
                <View style={styles.otpCardWheel} />
              </View>
            </View>
            {/* Road (moved below car) */}
            <View style={styles.otpCardRoad} />
          </View>
          <CustomText style={styles.title}>Enter OTP</CustomText>
          <CustomText style={styles.subtitle}>We have sent a 4-digit code to your mobile number</CustomText>
          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <View
                key={idx}
              >
                <TextInput
                  ref={inputs[idx]}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: getInputBorderColor(idx),
                      backgroundColor: focusedIdx === idx ? '#fff' : '#FFF5F5',
                      shadowOpacity: focusedIdx === idx ? 0.18 : 0.08,
                    },
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, idx)}
                  onFocus={() => handleFocus(idx)}
                  onBlur={() => handleBlur(idx)}
                  returnKeyType="next"
                  autoFocus={idx === 0}
                  placeholder="-"
                  placeholderTextColor="#BDBDBD"
                />
              </View>
            ))}
          </View>
          {/* Static Continue Button (no animation) */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.85}>
            <CustomText style={styles.primaryButtonText}>Continue</CustomText>
          </TouchableOpacity>
          <View style={styles.resendContainer}>
            <CustomText style={styles.resendText}>Didn't receive the code? </CustomText>
            <TouchableOpacity onPress={handleResendOtp}>
              <CustomText style={styles.resendLink}>Resend</CustomText>
            </TouchableOpacity>
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
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginTop : -60,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 24,
    marginHorizontal: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minHeight: 600,
    maxWidth: 360,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Poppins',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
    paddingHorizontal: 35,
    width: '100%',
  },
  otpInput: {
    width: 55,
    height: 58,
    borderWidth: 2,
    borderColor: '#E53935',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 24,
    color: '#212121',
    fontWeight: 'bold',
    backgroundColor: '#FFF5F5',
    fontFamily: 'Poppins',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 280,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Poppins',
  },
  resendLink: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  otpCardIllustrationContainer: {
    width: '100%',
    minHeight: 140,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  otpCardBuildingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 140,
    marginBottom: 12,
  },
  otpCardBuildingBlock: {
    width: 36,
    height: 60,
    backgroundColor: '#eaeaea',
    borderRadius: 4,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  otpCardWindowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
  },
  otpCardBuilding: {
    position: 'absolute',
    bottom: 18,
    left: '20%',
    width: '60%',
    height: 60,
    backgroundColor: '#EAEAEA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 0,
  },
  otpCardRoad: {
    width: 140,
    height: 20,
    backgroundColor: '#bbb',
    borderRadius: 4,
    marginTop: 1,
    marginBottom: 2,
    alignSelf: 'center',
  },
  otpCardCar: {
    width: 90,
    height: 48,
    zIndex: 1,
    position: 'relative',
    marginTop: -12,
    alignSelf: 'center',
  },
  otpCardCarBody: {
    position: 'absolute',
    bottom: 10,
    width: 90,
    height: 24,
    backgroundColor: '#D9534F',
    borderRadius: 4,
  },
  otpCardCarRoof: {
    position: 'absolute',
    top: 0,
    left: 15,
    width: 60,
    height: 18,
    backgroundColor: '#9C9C9C',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  otpCardCarWindow: {
    position: 'absolute',
    top: 3,
    left:6,
    width: 20,
    height: 10,
    backgroundColor: '#FFF',
    borderRadius: 2,
    opacity: 0.85,
    borderWidth: 1,
    borderColor: '#e3f0ff',
  },
  otpCardWheelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpCardWheel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FFF',
  },
});

export default OtpScreen; 