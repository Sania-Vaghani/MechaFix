import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import MapView, { Marker } from 'react-native-maps';
import backArrowIcon from '../images/arrow.png';
import phoneIcon from '../images/phone.png';
import messageIcon from '../images/message.png';
import locIcon from '../images/loc.png';

export default function AssignedMech({ navigation }) {
  const mechanic = {
    name: 'John Doe',
    rating: '4.8',
    experience: '5 years',
    specialization: 'Car Mechanic',
    phone: '+1 234 567 8900',
    eta: '15 mins',
    distance: '3.57 km',
    location: 'LJ College Road, Ahmedabad, GJ, India',
    latitude: 22.991227,
    longitude: 72.488415,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(mechanic.location);

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
            {isLoading ? <ActivityIndicator size="small" color="#D9534F" /> : address}
          </CustomText>
          <CustomText style={styles.locationMeta}>Distance: {mechanic.distance}</CustomText>
          <CustomText style={styles.locationMeta}>ETA: {mechanic.eta}</CustomText>

          <View style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden' }}>
            <MapView
              style={{ width: '100%', height: 160 }}
              initialRegion={{
                latitude: mechanic.latitude,
                longitude: mechanic.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              region={{
                latitude: mechanic.latitude,
                longitude: mechanic.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: mechanic.latitude, longitude: mechanic.longitude }}
                title="Mechanic Location"
              />
            </MapView>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileImage}>
            <Text style={styles.initials}>{mechanic.name.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View style={styles.profileInfo}>
            <CustomText style={styles.name}>{mechanic.name}</CustomText>
            <View style={styles.ratingContainer}>
              <CustomText style={styles.ratingText}>{mechanic.rating}</CustomText>
              <Text style={styles.ratingIcon}>★</Text>
            </View>
            <CustomText style={styles.specialization}>{mechanic.specialization}</CustomText>
            <CustomText style={styles.experience}>{mechanic.experience} experience</CustomText>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Contact Mechanic</CustomText>
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactButton}>
              <Image source={phoneIcon} style={styles.contactIcon} />
              <CustomText style={styles.contactButtonText}>Call Now</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactButton, styles.messageButton]}>
              <Image source={messageIcon} style={[styles.contactIcon, styles.messageIcon]} />
              <CustomText style={[styles.contactButtonText, styles.messageButtonText]}>Message</CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Track Mechanic Button */}
        <TouchableOpacity style={styles.trackButton}>
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

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  contactOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', padding: 12, borderRadius: 10, marginRight: 10 },
  messageButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3B82F6', marginRight: 0 },
  contactIcon: { width: 20, height: 20, marginRight: 8, tintColor: '#fff' },
  messageIcon: { tintColor: '#3B82F6' },
  contactButtonText: { color: '#fff', fontWeight: '600' },
  messageButtonText: { color: '#3B82F6' },

  trackButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  trackButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
