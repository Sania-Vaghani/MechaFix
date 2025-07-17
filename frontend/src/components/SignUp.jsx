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
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import userIcon from '../images/user.png';
import emailIcon from '../images/email.png';
import padlockIcon from '../images/padlock.png';
import phoneIcon from '../images/phone.png';
import visibleIcon from '../images/visible.png';
import hiddenIcon from '../images/hidden.png';
import arrowIcon from '../images/arrow.png';
import { useNavigation } from '@react-navigation/native';
import { useUserType } from '../context/UserTypeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = () => {
  const navigation = useNavigation();
  const { userType } = useUserType();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [buttonAnim] = useState(new Animated.Value(1));

  const validateEmail = (email) => {
    // Simple email regex
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Optionally, validate phone number format here as well

    try {
      const response = await axios.post('http://10.0.2.2:8000/api/users/signup/', {
        username: name,
        email,
        phone,
        user_type: userType,
      });
      console.log(response)
      // Store info in AsyncStorage for later steps
      await AsyncStorage.setItem('signupInfo', JSON.stringify({
        username: name,
        email,
        phone,
        user_type: userType,
      }));
      alert('OTP sent to your email!');
      navigation.navigate('Otp', { email }); // <-- Pass email here!
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <LinearGradient
      colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          {/* MechaFix Logo at the very top */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 56, left: 20, zIndex: 20 }}
            onPress={() => navigation.navigate('UserTypeSelection')}
            activeOpacity={0.7}
          >
            <Image source={arrowIcon} style={{ width: 26, height: 26, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <View style={[styles.logoTopContainer, { flexDirection: 'row', justifyContent: 'center' }]}> 
            <View style={styles.logoTopBox}>
              <CustomText style={styles.logoTopText}>M</CustomText>
            </View>
            <CustomText style={styles.logoTopBrand}>MechaFix</CustomText>
          </View>
          {/* Top Illustration */}
          <View style={styles.illustrationContainer}>
            <CustomText style={styles.illustrationEmoji}>🚗</CustomText>
          </View>
          {/* Overlapping Card */}
          <View style={styles.cardWrapper}>
            <View style={styles.cardAccent} />
            <View style={styles.cardAccentRoad} />
            <View style={styles.cardAccentDividerRow}>
              <View style={[styles.cardAccentDivider, { left: '22%' }]} />
              <View style={[styles.cardAccentDivider, { left: '44%' }]} />
              <View style={[styles.cardAccentDivider, { left: '66%' }]} />
            </View>
            <View style={styles.card}>
              <CustomText style={styles.title}>Create Account</CustomText>
              <CustomText style={styles.subtitle}>
                {userType === 'mechanic' ? 'Join MechaFix as a Mechanic' : 'Join MechaFix as a User'}
              </CustomText>
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <Image source={userIcon} style={styles.inputImgIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#9E9E9E"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
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
                <View style={styles.inputRow}>
                  <Image source={phoneIcon} style={styles.inputImgIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#9E9E9E"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: buttonAnim }], width: '100%' }}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} activeOpacity={0.85}>
                  <CustomText style={styles.primaryButtonText}>Sign Up</CustomText>
                </TouchableOpacity>
              </Animated.View>
              <CustomText style={styles.termsText}>
                By signing up, you agree to our <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Terms</CustomText> & <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Privacy Policy</CustomText>.
              </CustomText>
            </View>
          </View>
          {/* Sign In Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <CustomText style={{ fontSize: 16, color: '#757575', fontFamily: 'Poppins' }}>
              Already have an account?{' '}
            </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <CustomText
                style={{
                  fontSize: 16,
                  color: '#E53935',
                  fontFamily: 'Poppins',
                  fontWeight: 'bold',
                  textDecorationLine: 'underline',
                  textShadowColor: 'rgba(229,57,53,0.12)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Sign In
              </CustomText>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
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
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: -10,
    zIndex: 2,
  },
  illustrationEmoji: {
    fontSize: 64,
    marginBottom: 0,
  },
  cardWrapper: {
    width: '90%',
    alignItems: 'center',
    marginTop: -40,
  },
  cardAccent: {
    width: '90%',
    height: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 2,
    zIndex: 1,
  },
  cardAccentRoad: {
    position: 'absolute',
    top: 30,
    left: '10%',
    width: '80%',
    height: 30,
    backgroundColor: '#444',
    borderRadius: 16,
    zIndex: 2,
  },
  cardAccentDividerRow: {
    position: 'absolute',
    top: 33,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    zIndex: 3,
    pointerEvents: 'none',
  },
  cardAccentDivider: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    top: 0.5,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginHorizontal: 18,
    marginTop:30,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minHeight: 420,
    width: 360,
    zIndex: 2,
  },
  title: {
    fontSize: 35,
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
  inputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    fontFamily: 'Poppins',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
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
  socialIconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
    marginBottom: 8,
  },
  socialIconBtn: {
    marginHorizontal: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialPngIcon: {
    width: 28,
    height: 28,
  },
  termsText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  logoTopContainer: {
    position: 'absolute',
    top: 75,
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
});

export default SignUp; 