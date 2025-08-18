import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import backArrowIcon from '../images/arrow.png';
import userIcon from '../images/user.png';
import phoneIcon from '../images/phone.png';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Requests() {
  const navigation = useNavigation();
  
  // Requests from backend
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mechanicId, setMechanicId] = useState(null);

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          console.log("No token found");
          return;
        }
  
        const res = await axios.get('http://10.0.2.2:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        console.log("🔹 Mechanic profile response:", res.data);
  
        // Ensure string ID is set
        const mechId = res.data.mechanic_id || res.data._id || res.data.id;
        console.log("✅ Setting mechanicId:", mechId);
  
        setMechanicId(String(mechId));
  
      } catch (err) {
        console.error("Error fetching mechanic profile:", err?.response?.data || err.message);
      }
    };
  
    fetchMechanic();
  }, []);
  
  // Fetch pending requests dynamically
  useEffect(() => {
    const fetchRequests = async () => {
      if (!mechanicId) {
        console.log("⏳ Waiting for mechanicId...");
        return;
      }
  
      try {
        const url = `http://10.0.2.2:8000/api/pending-requests/?mech_id=${mechanicId}`;
        console.log("📡 Fetching requests from:", url);
  
        const res = await axios.get(url);
        console.log("🔹 Pending requests API response:", res.data);
  
        if (res.data.status === 'success') {
          const formatted = res.data.requests.map(req => {
            let myDistance = "N/A";
  
            if (req.mechanics_list?.length) {
              const myEntry = req.mechanics_list.find(
                m => String(m.mech_id) === String(mechanicId)
              );
              console.log("➡️ Matching mech entry for me:", myEntry);
  
              if (myEntry?.road_distance_km != null) {
                myDistance = `${Number(myEntry.road_distance_km).toFixed(2)} km`;
            }

            }
  
            return {
              ...req,
              id: req._id,
              name: req.user_name || 'Unknown User',
              phone: req.user_phone || 'N/A',
              issue: req.breakdown_type || 'N/A',
              distance: myDistance,
              initials: req.user_name?.trim()
                ? req.user_name.split(' ').map(n => n[0]).join('').toUpperCase()
                : 'U'
            };
          });
          setPendingRequests(formatted);
        }
      } catch (err) {
        console.error('❌ Error fetching requests:', err?.response?.data || err.message);
      }
    };
  
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [mechanicId]);
  

  // Accept request handler
const handleAcceptRequest = async (requestId) => {
  Alert.alert(
    'Accept Request',
    'Do you want to accept this request?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            await axios.post('http://10.0.2.2:8000/api/accept-request/', {
              request_id: requestId,
              mech_id: mechanicId
            });
            // Remove accepted request from list
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
          } catch (err) {
            console.error("Accept failed:", err?.response?.data || err.message);
          }
        },
      },
    ]
  );
};


  // Reject request handler
  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post('http://10.0.2.2:8000/api/mechanic-reject/', {
                request_id: requestId,
                mech_id: mechanicId
              });
              setPendingRequests(prev => prev.filter(r => r.id !== requestId));
            } catch (err) {
              console.error("Reject failed:", err);
            }
          },
        },
      ]
    );
  };
  
  const handleDetail = (request) => {
    navigation.navigate('UserDetail', { request });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF4D4F', '#FF7875']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ping Request</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Heading */}
        <View style={styles.mainHeadingContainer}>
          <Image source={userIcon} style={styles.mainHeadingIcon} />
          <Text style={styles.mainHeading}>User Details</Text>
        </View>
        
        {pendingRequests.map((request, index) => (
          <View key={request.id} style={[styles.mainCard, index > 0 && styles.cardMargin]}>
            {/* User Row */}
            <View style={styles.userRow}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{request.initials}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{request.name}</Text>
                  <Text style={styles.userPhone}>{request.phone}</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>

            {/* Issue + Distance */}
            <View style={styles.detailsRow}>
              <Text style={styles.issueText}>Issue : {request.issue}</Text>
              <Text style={styles.distanceText}>Distance : {request.distance}</Text>
            </View>

            {/* Actions */}
            <View style={styles.bottomRow}>
              <View style={styles.buttonGroup}>
              <TouchableOpacity 
                  style={styles.acceptButton} 
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton} onPress={() => handleDetail(request)}>
                  <Text style={styles.detailButtonText}>Detail</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(request.id)}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
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
  scrollContent: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  scrollContentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 100,
    minHeight: '100%',
  },
  mainHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainHeadingIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#3B82F6',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    marginBottom: 16,
  },
  cardMargin: {
    marginTop: 0,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    position: 'absolute',
    top: -8,
    right: -8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  issueText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Poppins-Medium',
    flex: 1,
    marginRight: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'flex-start',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: '#6B7280',
    resizeMode: 'contain',
  },
  phoneText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  acceptButton: {
    backgroundColor: '#10B981',   // green
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  
  detailButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF4D4F',
  },
  badgeInactive: {
    backgroundColor: '#FF4D4F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  badgeTextActive: {
    color: '#FF4D4F',
  },
  badgeTextInactive: {
    color: '#FFFFFF',
  },
});
