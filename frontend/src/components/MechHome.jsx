import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import user2Icon from '../images/user2.png';
import settingIcon from '../images/setting.png';
import bellIcon from '../images/customer-service.png';
import chatIcon from '../images/chat.png';
import historyIcon from '../images/history.png';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MechTabBar from './MechTabBar';

export default function MechHome() {
  const [available, setAvailable] = useState(true);
  const navigation = useNavigation();

  // Placeholder data
  const recentRequests = [
    { id: 1, name: 'John Doe', issue: 'Battery Issue', distance: '2.3 km', action: 'Accept' },
    { id: 2, name: 'Alice Smith', issue: 'Engine Problem', distance: '1.8 km', action: 'View' },
  ];

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
          <Text style={styles.headerTitle}>MechaFix Pro</Text>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: 120 }} showsVerticalScrollIndicator={false}>
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
          <View style={[styles.infoCard, { backgroundColor: '#e0edff' }]}> 
            <Text style={styles.infoTitle}>Add Mechanic</Text>
            <Text style={styles.infoDesc}>Add team members</Text>
            <TouchableOpacity style={styles.infoBtn}>
              <Text style={styles.infoBtnText}>Add Now</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#d1fae5' }]}> 
            <Text style={styles.infoTitle}>Customer History</Text>
            <Text style={styles.infoDesc}>View past services</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: '#fff', borderColor: '#22C55E', borderWidth: 1 }]}> 
              <Text style={[styles.infoBtnText, { color: '#22C55E' }]}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Active Services */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Active Services</Text>
          <View style={styles.rowWrap}>
            <View style={[styles.serviceCard, { backgroundColor: '#fff7ed', borderColor: '#fdba74' }]}> 
              <Text style={styles.serviceTitle}>Ping Requests</Text>
              <Text style={styles.serviceDesc}>3 new requests</Text>
            </View>
            <View style={[styles.serviceCard, { backgroundColor: '#f0f7ff', borderColor: '#a1c4fd' }]}> 
              <Text style={styles.serviceTitle}>Live Chat & Call</Text>
              <Text style={styles.serviceDesc}>2 active chats</Text>
            </View>
          </View>
        </View>
        {/* Today's Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}><Text style={styles.overviewNum}>5</Text><Text style={styles.overviewLabel}>Requests</Text></View>
            <View style={styles.overviewItem}><Text style={styles.overviewNum}>3</Text><Text style={styles.overviewLabel}>Completed</Text></View>
            <View style={styles.overviewItem}><Text style={[styles.overviewNum, { color: '#f59e42' }]}>₹2.5k</Text><Text style={styles.overviewLabel}>Earnings</Text></View>
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
              <TouchableOpacity style={[styles.requestBtn, req.action === 'Accept' ? { backgroundColor: '#22C55E' } : { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.requestBtnText}>{req.action}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <MechTabBar state={navigation.getState()} navigation={navigation} />
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
    marginBottom: 0,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223B',
    flex: 1,
    fontFamily: 'Cormorant-Bold',
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
    color: '#2563EB',
    fontFamily: 'Poppins-Bold',
  },
  overviewLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
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
    borderRadius: 19,
    backgroundColor: '#a1c4fd',
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
