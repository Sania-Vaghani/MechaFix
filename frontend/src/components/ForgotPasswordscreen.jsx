// ForgotPasswordScreen.jsx
import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import arrowIcon from '../images/arrow.png';
import emailIcon from '../images/email.png';

const ForgotPasswordScreen = ({ route }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userType } = route.params || { userType: 'user' };

  const handleSendOtp = async () => {
    console.log('Current email value:', email);
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://10.0.2.2:8000/api/users/forgot-password/', {
        email: email.trim(),
        user_type: userType,
      });
      Alert.alert('Success', 'Password reset OTP has been sent to your email!');
      navigation.navigate('ForgotPasswordOtp', { email: email.trim(), userType });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
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
      { <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }}>
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
      </View> }
      
      <KeyboardAvoidingView
        style={[styles.container, { zIndex: 50 }]}
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
          <CustomText style={styles.title}>Forgot Password</CustomText>
          <CustomText style={styles.subtitle}>Enter your email to receive a password reset code</CustomText>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <Image source={emailIcon} style={styles.inputImgIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9E9E9E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleSendOtp} 
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <CustomText style={styles.primaryButtonText}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </CustomText>
          </TouchableOpacity>
          
          <View style={styles.backToLoginContainer}>
            <CustomText style={styles.backToLoginText}>Remember your password? </CustomText>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CustomText style={styles.backToLoginLink}>Back to Login</CustomText>
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
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 18,
    marginTop: 30,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minHeight: 420,
    width: 360,
    zIndex: 100,
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
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E53935',
    paddingHorizontal: 10,
    height: 46,
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
    marginBottom: 20,
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
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#757575',
    fontFamily: 'Poppins',
  },
  backToLoginLink: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});

export default ForgotPasswordScreen;