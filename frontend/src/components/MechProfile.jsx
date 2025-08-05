import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useNavigation } from '@react-navigation/native';
import backArrowIcon from '../images/arrow.png';
import settingIcon from '../images/setting.png';
import padlockIcon from '../images/padlock.png';
import historyIcon from '../images/history.png';
import customerServiceIcon from '../images/customer-service.png';
import engineerIcon from '../images/engineer.png';
import logoutIcon from '../images/logout.png';

export default function MechProfile() {
  const navigation = useNavigation();
  const [mechanic, setMechanic] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        const userType = await AsyncStorage.getItem('userType');
        console.log('=== MECHANIC PROFILE DEBUG ===');
        console.log('Token:', token);
        console.log('UserType:', userType);
        
        if (!token) {
          console.log('No token found');
          Alert.alert('Error', 'No authentication token found');
          return;
        }
        
        if (userType !== 'mechanic') {
          console.log('User type is not mechanic:', userType);
          Alert.alert('Error', 'User type is not mechanic: ' + userType);
          return;
        }
        
        console.log('Making API call to users/me/');
        const res = await API.get('users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API Response:', res);
        console.log('Mechanic data:', res.data);
        setMechanic(res.data);
        
      } catch (err) {
        console.log('=== API ERROR ===');
        console.log('Error details:', err);
        console.log('Error message:', err?.message);
        console.log('Error response:', err?.response?.data);
        console.log('Error status:', err?.response?.status);
        
        let errorMessage = 'Failed to fetch mechanic profile';
        if (err?.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Mechanic profile not found.';
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        Alert.alert('Error', errorMessage);
      }
    };
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF4D4F', '#FF6B6B']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Image source={backArrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dynamic Mechanic Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {mechanic ? mechanic.username?.substring(0, 2).toUpperCase() || 'MG' : 'MG'}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.garageName}>
                {mechanic ? mechanic.username || 'Loading...' : 'Loading...'}
              </Text>
              <Text style={styles.contactInfo}>
                {mechanic ? `+91 ${mechanic.phone || ''}` : ''}
              </Text>
              <Text style={styles.contactInfo}>
                {mechanic ? mechanic.email || '' : ''}
              </Text>
              <View style={styles.ratingSection}>
                <View style={styles.stars}>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.star}>★</Text>
                </View>
                <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Performance Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statCircle, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.statNumber, { color: '#16A34A' }]}>98%</Text>
              </View>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statCircle, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statNumber, { color: '#D97706' }]}>₹45k</Text>
              </View>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
          </View>
        </View>

        {/* Settings Menu Card */}
        <View style={styles.optionsCard}>
          <ProfileOption icon={settingIcon} label="Settings" />
          <ProfileOption icon={padlockIcon} label="Modify Credentials" />
          <ProfileOption icon={historyIcon} label="Transaction History" />
          <ProfileOption icon={customerServiceIcon} label="Contact Us" />
          <ProfileOption icon={engineerIcon} label="Help and FAQs" isLast />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              'Confirm Logout',
              'Are you sure you want to log out?',
              [
                {
                  text: 'No',
                  style: 'cancel',
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    await AsyncStorage.removeItem('jwtToken');
                    await AsyncStorage.removeItem('userType');
                    navigation.navigate('Login');
                  },
                  style: 'destructive',
                },
              ],
              { cancelable: true }
            );
          }}
        >
          <Image source={logoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const ProfileOption = ({ icon, label, isLast }) => (
  <TouchableOpacity style={[styles.optionRow, isLast && { borderBottomWidth: 0 }]}> 
    <Image source={icon} style={styles.optionIcon} />
    <Text style={styles.optionLabel}>{label}</Text>
    <Text style={styles.optionArrow}>{'>'}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    height: 110,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingTop: 120,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  profileInfo: {
    flex: 1,
  },
  garageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
    color: '#FBBF24',
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 0,
    marginBottom: 38,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1.2,
    borderBottomColor: '#F0F1F6',
    backgroundColor: 'transparent',
  },
  optionIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    tintColor: '#FF4D4F',
    resizeMode: 'contain',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Medium',
  },
  optionArrow: {
    fontSize: 18,
    color: '#B0B0B0',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    marginHorizontal: 0,
    marginBottom: 18,
    paddingVertical: 14,
    justifyContent: 'center',
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
    resizeMode: 'contain',
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});
