import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import MapView, { Marker } from 'react-native-maps';
import backArrowIcon from '../images/arrow.png';
import phoneIcon from '../images/phone.png';
import messageIcon from '../images/message.png';
import locIcon from '../images/loc.png';
import { useRoute } from '@react-navigation/native';

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default function AssignedMech({ navigation }) {
  const route = useRoute();
  const assigned = route.params?.assigned_worker || {};
  const garageCoords = route.params?.garage_coords || assigned?.garage_coords || {};
  const userCoords = route.params?.user_coords || {};
  const mechName = assigned?.worker_name || 'Mechanic Worker';
  const mechPhone = assigned?.worker_phone || '';
  const distanceKm = (userCoords?.lat && garageCoords?.lat)
    ? haversine(Number(userCoords.lat), Number(userCoords.lon), Number(garageCoords.lat), Number(garageCoords.lon)).toFixed(2)
    : null;

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Get OTP from route params or generate a placeholder if not available
    const routeOtp = route.params?.otp_code || assigned?.otp_code;
    if (routeOtp) {
      setOtp(routeOtp.toString());
    } else {
      // Fallback to a placeholder if OTP not available
      setOtp('----');
    }
  }, [route.params?.otp_code, assigned?.otp_code]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF4D4F', '#FF7875']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Assigned Mechanic</CustomText>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View style={styles.content}>
        {/* 🚗 Live Location Card (TOP) */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.headingRow}>
              <Image source={locIcon} style={styles.cardIcon} />
              <CustomText style={styles.cardTitle}>Live Location</CustomText>
            </View>
            <TouchableOpacity style={styles.navigateBtn}>
              <CustomText style={styles.navigateBtnText}>Navigate</CustomText>
            </TouchableOpacity>
          </View>

          <CustomText style={styles.locationAddress}>
            {isLoading ? <ActivityIndicator size="small" color="#D9534F" /> : (address || 'Garage location shown on map')}
          </CustomText>
          {!!distanceKm && <CustomText style={styles.locationMeta}>Distance (as-the-crow-flies): {distanceKm} km</CustomText>}

          <View style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden' }}>
            <MapView
              style={{ width: '100%', height: 160 }}
              initialRegion={{
                latitude: Number(garageCoords.lat) || 22.991227,
                longitude: Number(garageCoords.lon) || 72.488415,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {!!userCoords?.lat && !!userCoords?.lon && (
                <Marker
                  coordinate={{ latitude: Number(userCoords.lat), longitude: Number(userCoords.lon) }}
                  title="Your Location"
                  description={route.params?.user_name}
                />
              )}
              {!!garageCoords?.lat && !!garageCoords?.lon && (
                <Marker
                  coordinate={{ latitude: Number(garageCoords.lat), longitude: Number(garageCoords.lon) }}
                  title={assigned?.garage_name || 'Garage'}
                  description="Garage Location"
                  pinColor="#FF4D4F"
                />
              )}
            </MapView>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileImage}>
            <Text style={styles.initials}>{mechName.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.profileInfo}>
            <CustomText style={styles.name}>{mechName}</CustomText>
            <View style={styles.ratingContainer}>
            </View>
            <CustomText style={styles.specialization}>{assigned?.garage_name}</CustomText>
            <CustomText style={styles.experience}>Assigned worker</CustomText>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={async () => {
              console.log('📞 Call button pressed. Available data:', {
                mechPhone,
                assigned,
                worker_phone: assigned?.worker_phone,
                mech_phone: assigned?.mech_phone,
                phone: assigned?.phone
              });
              
              // Try multiple possible phone number fields
              const phoneToCall = mechPhone || assigned?.mech_phone || assigned?.phone || assigned?.worker_phone;
              
              if (!phoneToCall || phoneToCall === 'N/A') {
                Alert.alert('Error', 'Phone number not available');
                return;
              }
              
              const tel = `tel:${phoneToCall}`;
              const can = await Linking.canOpenURL(tel);
              if (can) {
                Linking.openURL(tel);
              } else {
                Alert.alert('Error', 'Calling not supported');
              }
            }}
          >
            <Image source={phoneIcon} style={styles.callIcon} />
          </TouchableOpacity>
        </View>

        {/* OTP Section */}
        <View style={styles.otpSection}>
          <CustomText style={styles.otpTitle}>4-Digit Code for Verification</CustomText>
          <View style={styles.otpBox}>
            <CustomText style={styles.otpText}>{otp}</CustomText>
          </View>
          <CustomText style={styles.otpSubtitle}>
            Share this code with the mechanic worker after he completes his service.
          </CustomText>
        </View>

        {/* Track Mechanic Button */}
        <TouchableOpacity 
          style={styles.trackButton}
          onPress={() => {
            navigation.navigate('TrackingMap', {
              user_coords: userCoords,
              garage_coords: garageCoords,
              assigned_worker: assigned,
              user_name: route.params?.user_name
            });
          }}
        >
          <CustomText style={styles.trackButtonText}>Track Mechanic</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 18, height: 18, tintColor: '#fff' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginLeft: 20 },
  placeholder: { width: 40 },
  content: { flex: 1, padding: 16 },

  // Card (Map)
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 10, marginBottom: 20, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headingRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 6 },
  cardIcon: { width: 20, height: 20, resizeMode: 'contain' },
  locationAddress: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  locationMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  navigateBtn: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  navigateBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  profileCard: { backgroundColor: '#fff', borderRadius: 14, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 2 },
  profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  initials: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingText: { color: '#F59E0B', fontWeight: '600', marginRight: 4 },
  ratingIcon: { color: '#F59E0B' },
  specialization: { color: '#4B5563', marginBottom: 2 },
  experience: { color: '#6B7280' },
  callButton: { backgroundColor: '#3B82F6', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  callIcon: { width: 22, height: 22, tintColor: '#fff' },

  trackButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  trackButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // OTP Styles
  otpSection: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 20, elevation: 2 },
  otpTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  otpBox: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 25, marginBottom: 12 },
  otpText: { fontSize: 28, fontWeight: 'bold', color: '#065F46', letterSpacing: 5 },
  otpSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
