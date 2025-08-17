import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
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
import user2Icon from '../images/user2.png';
import emergencyIcon from '../images/emergency-call.png';
import { useUserType } from '../context/UserTypeContext';
import { useLogout } from '../hooks/useLogout';

export default function MechProfile() {
  const navigation = useNavigation();
  const [mechanic, setMechanic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userType } = useUserType();
  const { handleLogout } = useLogout();

  console.log('🔄 [MechProfile] Component rendered - userType:', userType);

  useEffect(() => {
    console.log('🔄 [MechProfile] useEffect triggered');
    
    const fetchProfile = async () => {
      console.log('🔄 [MechProfile] fetchProfile started');
      
      // Only fetch if we're a mechanic
      if (userType !== 'mechanic') {
        console.log('⚠️ [MechProfile] Not a mechanic, skipping profile fetch');
        setIsLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem('jwtToken');
        
        console.log('📱 [MechProfile] Token check:', {
          token: token ? 'EXISTS' : 'NULL',
          userType
        });
        
        if (!token) {
          console.log('❌ [MechProfile] No token found');
          setIsLoading(false);
          return;
        }
        
        console.log('✅ [MechProfile] Making API call to users/me/');
        const res = await API.get('users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ [MechProfile] Mechanic data fetched:', res.data);
        setMechanic(res.data);
        
      } catch (err) {
        console.error('❌ [MechProfile] API Error:', {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data
        });
        
        let errorMessage = 'Failed to fetch mechanic profile';
        if (err?.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Mechanic profile not found.';
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        Alert.alert('Error', errorMessage);
      } finally {
        setIsLoading(false);
        console.log('🏁 [MechProfile] fetchProfile completed');
      }
    };

    fetchProfile();
  }, [userType]);

  // Show loading state
  if (isLoading) {
    console.log('⏳ [MechProfile] Showing loading state');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading mechanic profile...</Text>
      </View>
    );
  }

  // Don't render if not a mechanic
  if (userType !== 'mechanic') {
    console.log('⚠️ [MechProfile] Not a mechanic account, showing message');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Not a mechanic account</Text>
      </View>
    );
  }

  // Show loading state while fetching mechanic data
  if (!mechanic) {
    console.log('⏳ [MechProfile] Showing mechanic data loading state');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading mechanic profile...</Text>
      </View>
    );
  }

  console.log('✅ [MechProfile] Rendering mechanic profile UI');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerProfile}>
        <TouchableOpacity style={styles.backArrow} onPress={() => {
          if (navigation.navigate) {
            navigation.navigate('Home');
          } else if (navigation.goBack) {
            navigation.goBack();
          }
        }}>
          <Image source={backArrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', position: 'relative' },styles.profileHead]}> 
          <Text style={styles.headerTitleProfile}>Profile</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Image source={user2Icon} style={styles.avatar} />
          </View>
          <Text style={styles.profileName}>{mechanic.username || 'Loading...'}</Text>
          <TouchableOpacity
            onPress={async () => {
              const phoneNumber = mechanic ? mechanic.phone : '';
              const url = `tel:${phoneNumber}`;
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Calling is not supported on this device.');
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.profilePhone, { color: '#2563EB'}]}>
              {mechanic ? `+91 ${mechanic.phone}` : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.profileEmail}>{mechanic ? mechanic.email : ''}</Text>
          <Text style={styles.garageName}>{mechanic ? mechanic.garage_name : ''}</Text>
        </View>
        {/* Options Card */}
        <View style={styles.optionsCard}>
          <ProfileOption icon={settingIcon} label="Settings" />
          <ProfileOption icon={emergencyIcon} label="Emergency Contacts" />
          <ProfileOption icon={padlockIcon} label="Modify Credentials" />
          <ProfileOption icon={historyIcon} label="Service History" />
          <ProfileOption icon={customerServiceIcon} label="Contact Support" />
          <ProfileOption icon={engineerIcon} label="Help and FAQs" isLast />
        </View>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => handleLogout(true)}>
          <Image source={logoutIcon} style={[styles.logoutIcon, { tintColor: '#fff', marginRight: 12 }]} />
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
    padding: 0,
  },
  headerProfile: {
    backgroundColor: '#FF4D4F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  profileHead: {
    flex: 1,
  },
  headerTitleProfile: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Cormorant-Bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    margin: 18,
    marginTop: 15,
    marginBottom: 15,
    paddingVertical: 28,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    tintColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 1,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  garageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 18,
    marginTop: 0,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    marginHorizontal: 18,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});
