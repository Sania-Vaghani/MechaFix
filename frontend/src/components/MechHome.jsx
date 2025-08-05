import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import user2Icon from '../images/user2.png';
import settingIcon from '../images/setting.png';
import bellIcon from '../images/customer-service.png';
import chatIcon from '../images/chat.png';
import historyIcon from '../images/history.png';
import addIcon from '../images/add.png';
import customerIcon from '../images/customer.png';
import hiIcon from '../images/hi.png';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';


export default function MechHome() {
  const [available, setAvailable] = useState(true);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  // Placeholder data
  const recentRequests = [
    { id: 1, name: 'John Doe', issue: 'Battery Issue', distance: '2.3 km', action: 'View' },
    { id: 2, name: 'Alice Smith', issue: 'Engine Problem', distance: '1.8 km', action: 'View' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      const userType = await AsyncStorage.getItem('userType');
      if (token && userType === 'mechanic') {
        try {
          const res = await API.get('users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.log('Failed to fetch mechanic profile', err);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleToggle = async (value) => {
    setAvailable(value);
    const token = await AsyncStorage.getItem('jwtToken');
    fetch('http://10.0.2.2:8000/api/users/mech/update-availability/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        active_mech: value,
      }),
    })
    .then(async res => {
      const text = await res.text();
      console.log('Raw response:', res.status, text);
      try {
        const data = JSON.parse(text);
        console.log('API response:', data);
      } catch (e) {
        console.error('JSON parse error:', e, text);
      }
    })
    .catch(err => {
      console.error('API error:', err);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
      <LinearGradient
        colors={['#f7cac9', '#f3e7e9', '#a1c4fd']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <Image source={user2Icon} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>
              {user ? `Hello, ${user.username}` : 'Hello!'}
              </Text>
              <Image source={hiIcon} style={{ width: 38, height: 38, marginLeft: 6, marginTop: 2 }} />
            </View>
            <Text style={styles.headerSubtitle}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, paddingTop: 120 }} showsVerticalScrollIndicator={false}>
        {/* Availability Status */}
        <View style={styles.statusCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.statusTitle}>Availability Status</Text>
            <Switch
              value={available}
              onValueChange={handleToggle}
              thumbColor={available ? '#22C55E' : '#FF4D4F'}
              trackColor={{ true: '#d1fae5', false: '#ffe5e5' }}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <View style={[styles.statusDot, { backgroundColor: available ? '#22C55E' : '#FF4D4F' }]} />
            <Text style={[styles.statusAvailable, { color: available ? '#22C55E' : '#FF4D4F' }]}>{available ? 'Available for Service' : 'Not Available'}</Text>
          </View>
          <Text style={styles.statusDesc}>{available ? 'You will receive breakdown requests' : 'You are not receiving requests'}</Text>
        </View>
        {/* Add Mechanic & Customer History */}
        <View style={styles.rowWrap}>
          <View style={[styles.infoCard, { backgroundColor: '#2563EB' }]}> 
            <View style={styles.infoIconContainer}>
              <Image source={addIcon} style={styles.infoIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: '#fff' }]}>Add Mechanic</Text>
            <Text style={[styles.infoDesc, { color: '#fff' }]}>Add team members</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: '#fff' }]}>
              <Text style={[styles.infoBtnText, { color: '#2563EB' }]}>Add Now</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#22C55E' }]}> 
            <View style={styles.infoIconContainer}>
              <Image source={customerIcon} style={styles.infoIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: '#fff' }]}>Customer History</Text>
            <Text style={[styles.infoDesc, { color: '#fff' }]}>View past services</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: '#fff' }]}> 
              <Text style={[styles.infoBtnText, { color: '#22C55E' }]}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Today's Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#FF4D4F' }]}>
                <Text style={styles.overviewNum}>5</Text>
              </View>
              <Text style={styles.overviewLabel}>Requests</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.overviewNum}>2</Text>
              </View>
              <Text style={styles.overviewLabel}>Pending</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#22C55E' }]}>
                <Text style={styles.overviewNum}>3</Text>
              </View>
              <Text style={styles.overviewLabel}>Completed</Text>
            </View>
          </View>
        </View>
        {/* Recent Requests */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          {recentRequests.map(req => (
            <View key={req.id} style={styles.requestRow}>
              <View style={styles.requestAvatar}><Text style={styles.requestAvatarText}>{req.name.split(' ').map(n => n[0]).join('')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{req.name}</Text>
                <Text style={styles.requestIssue}>{req.issue} • {req.distance} away</Text>
              </View>
              <TouchableOpacity style={[styles.requestBtn, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.requestBtnText}>{req.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 18,
    paddingTop: 48,
    height: 110,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:30,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 4,
    borderColor:'#fff',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },

  headerIconBtn: {
    marginLeft: 8,
    padding: 7,
  },
  headerImgIcon: {
    width: 27,
    height: 27,
    resizeMode: 'contain',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  statusAvailable: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statusDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  rowWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    marginRight: 8,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
    marginBottom: 10,
  },
  infoBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  infoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  infoIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    marginRight: 8,
    marginLeft: 0,
    borderWidth: 1.5,
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  overviewLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  overviewCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 10,
  },
  requestAvatar: {
    width: 38,
    height: 38,
    borderRadius: 29,
    backgroundColor: '#C189FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  requestName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  requestIssue: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  requestBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginLeft: 8,
  },
  requestBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
});
