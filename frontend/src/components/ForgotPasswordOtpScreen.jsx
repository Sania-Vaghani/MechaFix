// ForgotPasswordOtpScreen.jsx
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
import axios from 'axios';
import arrowIcon from '../images/arrow.png';
import padlockIcon from '../images/padlock.png';

const ForgotPasswordOtpScreen = ({ route }) => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const { email, userType } = route.params || {};

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

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please enter both passwords');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const enteredOtp = otp.join('');
      await axios.post('http://10.0.2.2:8000/api/users/reset-password/', {
        email,
        otp: enteredOtp,
        new_password: newPassword,
        user_type: userType,
      });
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post('http://10.0.2.2:8000/api/users/forgot-password/', {
        email,
        user_type: userType,
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
        onPress={() => navigation.goBack()}
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
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0, marginBottom: 40 }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#D9534F', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <CustomText style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', fontFamily: 'Poppins' }}>M</CustomText>
          </View>
          <CustomText style={{ fontSize: 40, color: '#333', fontFamily: 'Cormorant-Bold', letterSpacing: 1 }}>MechaFix</CustomText>
        </View>
        
        {/* Card */}
        <View style={styles.card}>
          <CustomText style={styles.title}>Reset Password</CustomText>
          <CustomText style={styles.subtitle}>Enter the 4-digit code sent to your email</CustomText>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, idx) => (
              <View key={idx}>
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
          
          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
            <Image source={padlockIcon} style={styles.inputImgIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#9E9E9E"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                <Image source={showPassword ? require('../images/visible.png') : require('../images/hidden.png')} style={styles.inputImgIcon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputRow}>
            <Image source={padlockIcon} style={styles.inputImgIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#9E9E9E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                <Image source={showConfirmPassword ? require('../images/visible.png') : require('../images/hidden.png')} style={styles.inputImgIcon} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Reset Password Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleResetPassword} 
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <CustomText style={styles.primaryButtonText}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </CustomText>
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
    marginBottom: 30,
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontFamily: 'Poppins',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  inputImgIcon: {
    width: 22,
    height: 22,
    marginLeft: 8,
    resizeMode: 'contain',
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
  disabledButton: {
    backgroundColor: '#ccc',
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
});

export default ForgotPasswordOtpScreen;