import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import phoneIcon from '../images/user.png'; // Replace with phone icon if available

const PhoneNum = () => {
  const [phone, setPhone] = useState('');

  const handleGetOtp = () => {
    // Handle get OTP logic here
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
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* MechaFix Logo and Name at the very top */}
        <View style={[styles.logoTopContainer, { flexDirection: 'row', justifyContent: 'center' }]}> 
          <View style={styles.logoTopBox}>
            <CustomText style={styles.logoTopText}>M</CustomText>
          </View>
          <CustomText style={styles.logoTopBrand}>MechaFix</CustomText>
        </View>
        {/* Overlapping Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <CustomText style={styles.title}>Enter Mobile Number</CustomText>
            <CustomText style={styles.subtitle}>We'll send you an OTP to verify your number</CustomText>
            <View style={styles.inputRow}>
              <View style={styles.countryCodeBox}>
                <CustomText style={styles.countryCodeText}>+91</CustomText>
              </View>
              <TextInput
                style={[styles.input, { fontFamily: 'Poppins', fontWeight: 'normal', fontSize: 18, color: '#333' }]}
                placeholder="Enter your mobile number"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetOtp} activeOpacity={0.85}>
              <CustomText style={styles.primaryButtonText}>Get OTP</CustomText>
            </TouchableOpacity>
            <CustomText style={styles.termsText}>
              By continuing, you agree to our <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Terms</CustomText> & <CustomText style={{ color: '#E53935', textDecorationLine: 'underline' }}>Privacy Policy</CustomText>.
            </CustomText>
            {/* Car illustration at the bottom of the card (clean, premium style) */}
            <View style={{ alignItems: 'center', marginTop: 30, minHeight: 70 }}>
              {/* Car */}
              <View style={{ width: 90, height: 48, position: 'relative', alignSelf: 'center' }}>
                {/* Car body */}
                <View style={{ position: 'absolute', bottom: 10, width: 90, height: 24, backgroundColor: '#D9534F', borderRadius: 4 }} />
                {/* Car roof */}
                <View style={{ position: 'absolute', top: 0, left: 15, width: 60, height: 18, backgroundColor: '#9C9C9C', borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                {/* Car windows */}
                <View style={{ position: 'absolute', top: 3, left: 21, width: 20, height: 10, backgroundColor: '#FFF', borderRadius: 2, opacity: 0.85, borderWidth: 1, borderColor: '#e3f0ff' }} />
                <View style={{ position: 'absolute', top: 3, left: 47, width: 20, height: 10, backgroundColor: '#FFF', borderRadius: 2, opacity: 0.85, borderWidth: 1, borderColor: '#e3f0ff' }} />
                {/* Wheels */}
                <View style={{ position: 'absolute', bottom: 0, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', borderWidth: 2, borderColor: '#FFF' }} />
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', borderWidth: 2, borderColor: '#FFF' }} />
                </View>
              </View>
              {/* Road */}
              <View style={{ width: 90, height: 10, backgroundColor: '#bbb', borderRadius: 4, marginTop: 2, marginBottom: 2, alignSelf: 'center' }} />
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
    top: 90,
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
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Cormorant-Bold',
    marginLeft: 10,
    letterSpacing: 1,
    alignSelf: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  illustrationEmoji: {
    fontSize: 64,
    marginBottom: 0,
  },
  cardWrapper: {
    width: '90%',
    alignItems: 'center',
    marginTop: -12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 64,
    marginTop:90,
    marginHorizontal: 18,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minWidth: 340,
    minHeight: 520,
    width: '100%',
    zIndex: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 15,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: 'Poppins',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E53935',
    paddingHorizontal: 10,
    height: 46,
    marginBottom: 18,
    width: '100%',
  },
  countryCodeBox: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  termsText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
});

export default PhoneNum; 