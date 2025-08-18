import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import backArrowIcon from '../images/arrow.png';
import user2Icon from '../images/user2.png';
import phoneIcon from '../images/phone.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function WorkerPage() {
  const navigation = useNavigation();
  const [mechanicId, setMechanicId] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) return;
        const res = await axios.get('http://10.0.2.2:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mechId = res.data.mechanic_id || res.data._id || res.data.id;
        setMechanicId(String(mechId));
      } catch (e) {
        console.log('WorkerPage: profile error', e?.message);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!mechanicId) return;
      try {
        const url = `http://10.0.2.2:8000/api/pending-requests/?mech_id=${mechanicId}`;
        const res = await axios.get(url);
        if (res.data?.status === 'success' && res.data.requests?.length) {
          // pick the first request as current assignment
          const r = res.data.requests[0];
          setAssignment({
            id: r._id,
            name: r.user_name || 'Unknown User',
            phone: r.user_phone || 'N/A',
            issue: r.breakdown_type || 'N/A',
            address: r.user_address || r.address || '',
            carModel: r.car_model || 'N/A',
            carNumber: r.license_plate || 'N/A', // Use license_plate from DB
            location: r.lat && r.lon ? { latitude: r.lat, longitude: r.lon } : null, // Use lat/lon from DB
          });
        }
      } catch (e) {
        console.log('WorkerPage: assignment error', e?.message);
      }
    };
    fetchAssignment();
  }, [mechanicId]);

  const onChangeOtp = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 3) inputsRef[idx + 1].current?.focus();
    if (!val && idx > 0) inputsRef[idx - 1].current?.focus();
  };

  const submitOtp = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      Alert.alert('OTP', 'Please enter the 4-digit OTP.');
      return;
    }
    // Hook for backend OTP verification if/when available.
    Alert.alert('OTP', `Submitted OTP: ${code}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF4D4F', '#FF4D4F', '#FF4D4F']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Image source={backArrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Page</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Image source={user2Icon} style={styles.userAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>{assignment?.name || 'No current assignment'}</Text>
              <Text style={styles.issueText}>Issue: {assignment?.issue || '-'}</Text>
              <Text style={styles.detailText}>Car: {assignment?.carModel || '-'} ({assignment?.carNumber || '-'})</Text>
              {!!assignment?.address && <Text style={styles.addrText} numberOfLines={2}>{assignment.address}</Text>}
            </View>
            {!!assignment?.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={async () => {
                  const tel = `tel:${assignment.phone}`;
                  const can = await Linking.canOpenURL(tel);
                  if (can) Linking.openURL(tel);
                  else Alert.alert('Error', 'Calling not supported on this device.');
                }}
              >
                <Image source={phoneIcon} style={styles.callIcon} />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {assignment?.location?.latitude && assignment?.location?.longitude && (
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: assignment.location.latitude,
                longitude: assignment.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={assignment.location}
                title={assignment.name}
                description={assignment.address}
              />
            </MapView>
          </View>
        )}

        <View style={styles.otpCard}>
          <Text style={styles.otpTitle}>OTP Verification</Text>
          <Text style={styles.otpSubTitle}>Enter the OTP given by the user for verification</Text>
          <View style={styles.otpRow}>
            {otp.map((d, i) => (
              <TextInput
                key={i}
                ref={inputsRef[i]}
                value={d}
                onChangeText={(t) => onChangeOtp(t, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpBox}
                placeholder=""
                placeholderTextColor="#b0b3c6"
              />
            ))}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={submitOtp} activeOpacity={0.85}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backArrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  backArrowIcon: { width: 18, height: 18, tintColor: '#FF4D4F', resizeMode: 'contain' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 28, color: '#fff', fontFamily: 'Cormorant-Bold', marginRight: 40 },
  content: { padding: 18, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: '#f3f4ff' },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#22223B', marginBottom: 2 },
  issueText: { fontSize: 14, color: '#444' },
  detailText: { fontSize: 14, color: '#444', marginTop: 4 },
  addrText: { fontSize: 13, color: '#666', marginTop: 4 },
  callBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffefef', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginLeft: 10 },
  callIcon: { width: 16, height: 16, tintColor: '#FF4D4F', marginRight: 6 },
  callText: { color: '#FF4D4F', fontWeight: '600' },

  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  map: {
    height: 200,
  },

  otpCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 19,
    marginTop: 16, // Add margin to prevent overlap
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  otpTitle: { fontSize: 18, fontWeight: 'bold', color: '#22223B', marginBottom: 8 },
  otpSubTitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  otpBox: {
    width: 58,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d8d8ff',
    backgroundColor: '#f6f8ff',
    textAlign: 'center',
    fontSize: 20,
    color: '#22223B',
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
