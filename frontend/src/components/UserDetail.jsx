import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../Components/CustomText';
import MapView, { Marker } from 'react-native-maps';
import backArrowIcon from '../images/arrow.png';
import locIcon from '../images/loc.png';
import carIcon from '../images/car.png';
import axios from "axios";
import WorkerAssignmentModal from './WorkerAssignmentModal';

export default function UserDetail() {
  const [fullRequest, setFullRequest] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [assignedWorker, setAssignedWorker] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params || {};

  // Ensure request exists and has required properties
  if (!request) {
    return (
      <View style={styles.centered}>
        <CustomText style={styles.errorText}>No request details found.</CustomText>
      </View>
    );
  }

  const location = request.location || {
    address: 'MG Road, Bangalore',
    distance: request.distance || '2.3 km',
    eta: request.eta || '15 mins',
  };
  
  const car = {
    model: request.car_model || 'Unknown',
    plate: request.license_plate || 'N/A',
    issue: request.issue_type || 'N/A',
    description: request.description || 'No description provided'
  };

  const [address, setAddress] = useState('Fetching address...');
  const [isLoading, setIsLoading] = useState(true);

  // Ensure lat/lon are numbers
  const lat = parseFloat(request.latitude) || 22.991227;
  const lon = parseFloat(request.longitude) || 72.488415;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (request.id) {
          const res = await axios.get(`http://10.0.2.2:8000/api/request-detail/${request.id}/`);
          if (res.data.status === "success") {
              setFullRequest(res.data.request);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching request detail:", err);
      }
    };
    fetchDetail();
  }, [request.id]);
  

  const fetchAddress = async (lat, lon) => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/api/mechanic/reverse-geocode/?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data.address || "Address not available";
    } catch (err) {
      console.error("Backend reverse geo error:", err);
      return "Error fetching address";
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const addr = await fetchAddress(lat, lon);
      setAddress(addr);
      setIsLoading(false);
    })();
  }, [lat, lon]);

  const handleAccept = () => {
    // Show worker assignment modal instead of direct accept
    setShowWorkerModal(true);
  };

  const handleWorkerAssigned = (worker) => {
    setAssignedWorker(worker);
    Alert.alert(
      "Request Accepted", 
      `Request accepted and assigned to ${worker.name} ✅`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleReject = () => {
    Alert.alert("Reject", "You rejected the request ❌");
    // TODO: Call backend API for reject
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF4D4F', '#FF7875']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>User Detail</CustomText>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Live Location Card */}
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
          {isLoading ? (
            <ActivityIndicator size="small" color="#D9534F" />
          ) : (
            address
          )}
        </CustomText>
        <CustomText style={styles.locationMeta}>Distance: {location.distance}</CustomText>
        <CustomText style={styles.locationMeta}>ETA: {location.eta}</CustomText>
        <View style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden' }}>
          <MapView
            style={{ width: '100%', height: 160 }}
            initialRegion={{
              latitude: lat,
              longitude: lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: lat,
              longitude: lon,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={false} // Fixed: Changed from true to false to avoid boolean/object error
          >
            <Marker 
              coordinate={{ latitude: lat, longitude: lon }} 
              title="Breakdown Location" 
            />
          </MapView>
        </View>
      </View>

      {/* Car Details Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.headingRow}>
            <Image source={carIcon} style={styles.cardIcon} />
            <CustomText style={styles.cardTitle}>Car Details</CustomText>
          </View>
        </View>
        <CustomText style={styles.carModel}>
          {fullRequest?.car_model || "Unknown"}, {fullRequest?.license_plate || "N/A"}
        </CustomText>
        <CustomText style={styles.carIssue}>Issue: {fullRequest?.issue_type || "N/A"}</CustomText>
        <View style={styles.carDescBox}>
          <CustomText style={styles.carDesc}>{fullRequest?.description || "No description provided"}</CustomText>
        </View>
      </View>

      {/* Accept / Reject Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.acceptBtn, assignedWorker && styles.acceptBtnAssigned]} 
          onPress={handleAccept}
          disabled={!!assignedWorker} // Fixed: Ensure boolean value
        >
          <Text style={styles.btnText}>
            {assignedWorker ? `Assigned to ${assignedWorker.name}` : 'Accept'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>

      {/* Worker Assignment Modal */}
      <WorkerAssignmentModal
        visible={showWorkerModal}
        onClose={() => setShowWorkerModal(false)}
        requestId={request?.id}
        onWorkerAssigned={handleWorkerAssigned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    shadowColor: '#FF4D4F', shadowOpacity: 0.12, shadowRadius: 8,
    elevation: 6, zIndex: 10,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 18, height: 18, tintColor: '#fff', resizeMode: 'contain' },
  headerTitle: { color: '#fff', fontSize: 28, fontWeight: '600', fontFamily: 'Cormorant-Bold', textAlign: 'center' },
  placeholder: { width: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, margin: 18, padding: 22, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', fontFamily: 'Poppins-SemiBold' },
  locationAddress: { fontSize: 15, color: '#6B7280', fontFamily: 'Poppins-Regular', marginTop: 2 },
  locationMeta: { fontSize: 13, color: '#6B7280', fontFamily: 'Poppins-Regular', marginTop: 2 },
  navigateBtn: { backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  navigateBtnText: { fontSize: 15, color: '#fff', fontFamily: 'Poppins-SemiBold' },
  carModel: { fontSize: 15, color: '#1F2937', fontFamily: 'Poppins-SemiBold', marginTop: 10 },
  carIssue: { fontSize: 13, color: '#6B7280', fontFamily: 'Poppins-Regular', marginTop: 2 },
  carDescBox: { backgroundColor: '#F6F8FF', borderRadius: 10, padding: 12, marginTop: 10 },
  carDesc: { fontSize: 13, color: '#6B7280', fontFamily: 'Poppins-Regular' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon: { width: 24, height: 24, resizeMode: 'contain', marginRight: 8 },

  /** New buttons **/
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 20,
    gap: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  acceptBtnAssigned: {
    backgroundColor: '#059669', // Darker green for assigned state
  },
});