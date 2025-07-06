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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import userIcon from '../images/user.png';
import emailIcon from '../images/email.png';
import padlockIcon from '../images/padlock.png';
import hiddenIcon from '../images/hidden.png';
import visibleIcon from '../images/visible.png';
import arrowIcon from '../images/arrow.png';
import { useNavigation } from '@react-navigation/native';

const UserSignUp = () => {
  const navigation = useNavigation();
  const [tab, setTab] = useState('phone');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [buttonAnim] = useState(new Animated.Value(1));

  const handleSignUp = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Handle sign up logic here
      navigation.navigate('MainTabs');
    });
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
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
        <View style={{ position: 'absolute', top: 40, left: 30, width: 15, height: 15, borderRadius: 9, backgroundColor: '#E53935', opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: 120, right: 40, width: 22, height: 22, borderRadius: 11, backgroundColor: '#E53935', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 80, left: 60, width: 16, height: 16, borderRadius: 8, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 140, right: 20, width: 24, height: 24, borderRadius: 12, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 200, left: 100, width: 14, height: 14, borderRadius: 7, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 260, right: 80, width: 19, height: 19, borderRadius: 9.5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', bottom: 200, left: 120, width: 20, height: 20, borderRadius: 10, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 40, right: 100, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 320, left: 180, width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 260, right: 140, width: 21, height: 21, borderRadius: 10.5, backgroundColor: '#E53935', opacity: 0.21 }} />
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
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
            onPress={() => navigation.navigate('UserTypeSelection')}
            activeOpacity={0.7}
          >
            <Image source={arrowIcon} style={{ width: 26, height: 26, resizeMode: 'contain' }} />
          </TouchableOpacity>
          {/* Top Illustration */}
          <View style={styles.illustrationContainer}>
            {/* Placeholder illustration: car emoji, replace with image if available */}
            <CustomText style={styles.illustrationEmoji}>🚗</CustomText>
          </View>
          {/* Overlapping Card */}
          <View style={styles.cardWrapper}>
            <View style={styles.cardAccent} />
            {/* Road effect on card accent */}
            <View style={styles.cardAccentRoad} />
            {/* Broken road divider effect */}
            <View style={styles.cardAccentDividerRow}>
              <View style={[styles.cardAccentDivider, { left: '22%' }]} />
              <View style={[styles.cardAccentDivider, { left: '44%' }]} />
              <View style={[styles.cardAccentDivider, { left: '66%' }]} />
            </View>
            <View style={styles.card}>
              <CustomText style={styles.title}>Login</CustomText>
              <CustomText style={styles.subtitle}>Create your account to get started</CustomText>
              {/* Tab Slider */}
              <View style={styles.tabSlider}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    tab === 'phone' && styles.tabBtnActive,
                    { zIndex: tab === 'phone' ? 2 : 1 }
                  ]}
                  onPress={() => setTab('phone')}
                  activeOpacity={0.8}
                >
                  <Image source={userIcon} style={styles.tabIcon} />
                  <CustomText style={[styles.tabLabel, tab === 'phone' && styles.tabLabelActive]}>Phone</CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    tab === 'email' && styles.tabBtnActive,
                    { zIndex: tab === 'email' ? 2 : 1 }
                  ]}
                  onPress={() => setTab('email')}
                  activeOpacity={0.8}
                >
                  <Image source={emailIcon} style={styles.tabIcon} />
                  <CustomText style={[styles.tabLabel, tab === 'email' && styles.tabLabelActive]}>Email</CustomText>
                </TouchableOpacity>
              </View>
              {/* Form */}
              {tab === 'phone' ? (
                <View style={styles.inputRow}>
                  <CustomText style={styles.countryCode}>+91</CustomText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#9E9E9E"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    maxLength={10}
                  />
                </View>
              ) : (
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
                  <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordBtn}>
                    <CustomText style={styles.forgotPasswordText}>Forgot Password?</CustomText>
                  </TouchableOpacity>
                </View>
              )}
              <Animated.View style={{ transform: [{ scale: buttonAnim }], width: '100%' }}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} activeOpacity={0.85}>
                  <CustomText style={styles.primaryButtonText}>LOGIN</CustomText>
                </TouchableOpacity>
              </Animated.View>
              {/* Social Sign Up */}
              <View style={styles.socialIconRow}>
                <TouchableOpacity style={styles.socialIconBtn}>
                  <Image source={require('../images/facebook.png')} style={styles.socialPngIcon} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn}>
                  <Image source={require('../images/google.png')} style={styles.socialPngIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
              <CustomText style={styles.termsText}>
                By signing up, you agree to our <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Terms</CustomText> & <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Privacy Policy</CustomText>.
              </CustomText>
            </View>
          </View>
          {/* Sign Up Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <CustomText style={{ fontSize: 16, color: '#757575', fontFamily: 'Poppins' }}>
              Don't have an account?{' '}
            </CustomText>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
                Sign Up
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
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginBottom: 18,
    width: '100%',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#757575',
    fontSize: 15,
    fontFamily: 'Poppins',
  },
  tabTextActive: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    marginRight: 8,
  },
  tabSlider: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 18,
    width: '100%',
    padding: 4,
    alignItems: 'center',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
    tintColor: '#333',
  },
  tabLabel: {
    color: '#757575',
    fontSize: 15,
    fontFamily: 'Poppins',
  },
  tabLabelActive: {
    color: '#212121',
    fontWeight: 'bold',
  },
});

export default UserSignUp; 