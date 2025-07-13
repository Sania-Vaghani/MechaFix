import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import { useUserType } from '../context/UserTypeContext';

const UserTypeSelection = ({ navigation }) => {
  const { setUserType } = useUserType();
  const handleSelect = (type) => {
    setUserType(type);
    navigation.replace('Login');
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

      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <CustomText style={styles.logoText}>M</CustomText>
          </View>
          <CustomText style={styles.brandText}>MechaFix</CustomText>
        </View>

        {/* Selection Cards */}
        <View style={styles.contentContainer}>
          <CustomText style={styles.title}>Choose Your Role</CustomText>
          
          <View style={styles.cardsContainer}>
            {/* User Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelect('user')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <CustomText style={styles.iconText}>👤</CustomText>
                </View>
                <CustomText style={styles.cardTitle}>I'm a User</CustomText>
                <CustomText style={styles.cardDescription}>
                  Need roadside assistance or mechanic services
                </CustomText>
              </View>
            </TouchableOpacity>

            {/* Mechanic Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelect('mechanic')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#E53935' }]}>
                  <CustomText style={styles.iconText}>🔧</CustomText>
                </View>
                <CustomText style={styles.cardTitle}>I'm a Mechanic</CustomText>
                <CustomText style={styles.cardDescription}>
                  Provide roadside assistance and repair services
                </CustomText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <CustomText style={styles.footerText}>
          Select your role to continue with the appropriate interface
        </CustomText>
      </View>
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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  brandText: {
    fontSize: 38,
    color: '#333',
    fontFamily: 'Cormorant-Bold',
    letterSpacing: 1,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Cormorant-Bold',
  },
  cardsContainer: {
    width: '100%',
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#A7C9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 32,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Cormorant-Bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins',
    lineHeight: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins',
  },
});

export default UserTypeSelection; 