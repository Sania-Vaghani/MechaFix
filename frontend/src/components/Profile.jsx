import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api'; // your axios instance
import user2Icon from '../images/user2.png';
import settingIcon from '../images/setting.png';
import emergencyIcon from '../images/emergency-call.png';
import padlockIcon from '../images/padlock.png';
import historyIcon from '../images/history.png';
import customerServiceIcon from '../images/customer-service.png';
import engineerIcon from '../images/engineer.png';
import chatIcon from '../images/chat.png';
import logoutIcon from '../images/logout.png';
import arrowIcon from '../images/arrow.png';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      const userType = await AsyncStorage.getItem('userType');
      console.log('Token:', token, 'UserType:', userType);
      if (token && userType === 'user') {
        try {
          const res = await API.get('users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User data:', res.data);
          setUser(res.data);
        } catch (err) {
          console.log('Failed to fetch user profile', err);
        }
      }
    };
    fetchProfile();
  }, []);

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
          <Image source={arrowIcon} style={styles.backArrowIcon} />
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
          <Text style={styles.profileName}>{user ? user.username : 'Loading...'}</Text>
          <TouchableOpacity
            onPress={async () => {
              const phoneNumber = user ? user.phone : '';
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
              {user ? `+91 ${user.phone}` : ''}
            </Text>
          </TouchableOpacity>
          <Text style={styles.profileEmail}>{user ? user.email : ''}</Text>
        </View>
        {/* Options Card */}
        <View style={styles.optionsCard}>
          <ProfileOption icon={settingIcon} label="Settings" />
          <ProfileOption icon={emergencyIcon} label="Emergency Contacts" />
          <ProfileOption icon={padlockIcon} label="Modify Credentials" />
          <ProfileOption icon={historyIcon} label="Transaction History" />
          <ProfileOption icon={customerServiceIcon} label="Contact Us" />
          <ProfileOption icon={engineerIcon} label="Help and FAQs" isLast />
        </View>
        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
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
                  await AsyncStorage.removeItem('user');
                  navigation.navigate('Login');
                },
                style: 'destructive',
              },
            ],
            { cancelable: true }
          );
        }}>
          <Image source={logoutIcon} style={[styles.logoutIcon, { tintColor: '#fff', marginRight: 12 }]} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

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
    // marginTop:70,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    margin: 18,
    marginTop:15,
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
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
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
    tintColor: '#FF4D4F',
    resizeMode: 'contain',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  backArrow: {
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
  },
  backArrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FF4D4F',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4D4F',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitleProfile: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
    flex: 1,
  },
  profileHead:{
    marginLeft:-30,
  }
});

export default Profile; 