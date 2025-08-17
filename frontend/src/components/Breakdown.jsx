import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import arrowIcon from '../images/arrow.png';
import downArrow from '../images/down_arrow.png';
import { launchImageLibrary } from 'react-native-image-picker';
import photoCamera from '../images/photo-camera.png';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import RadarModal from './RadarModal';
import FoundMechanic from './FoundMechanic'; // Add this import
import { useNavigation } from '@react-navigation/native';


const issueTypes = [
  'Select Issue Type',
  'Car won\'t start',
  'Flat tire',
  'Battery issue',
  'Engine overheating',
  'Strange noise',
  'Other...'
];

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


const Breakdown = ({ navigation }) => {
  const [carModel, setCarModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [description, setDescription] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);


  const prevCoords = useRef(null);

// ✅ Load user once
useEffect(() => {
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("❌ Error loading logged in user:", err);
    }
  };
  loadUser();
}, []);

// ✅ Watch location
useEffect(() => {
  const watchId = Geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      if (prevCoords.current) {
        const distanceMoved = haversine(
          prevCoords.current.latitude,
          prevCoords.current.longitude,
          latitude,
          longitude
        );

        if (distanceMoved >= 2) {
          console.log(`📍 Moved ${distanceMoved.toFixed(2)} km. Refreshing mechanics...`);
          prevCoords.current = { latitude, longitude };
          await handleSend();
        }
      } else {
        prevCoords.current = { latitude, longitude };
      }
    },
    (error) => {
      console.warn("📡 Location error:", error.message);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 50,
      interval: 30000,
      fastestInterval: 15000,
    }
  );

  return () => {
    Geolocation.clearWatch(watchId);
  };
}, []);




  const handleSend = async () => {
    try {
      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;

          const response = await axios.post('http://10.0.2.2:8000/api/recommendations/', {
            lat: latitude,
            lon: longitude,
            breakdown_type: issueType || 'engine',
          });

          const mechList = response.data.mechanics;
          await AsyncStorage.setItem('topMechanics', JSON.stringify(mechList));
          setMechanics(mechList);
          console.log("✅ Mechanics stored:", mechList);

          // Show success message and navigate
          Alert.alert(
            "Success",
            "Breakdown request sent!",
            [
              {
                text: "OK",
                onPress: () =>
                  navigation.navigate('FoundMechanic', {
                    lat: latitude,
                    lon: longitude,
                    breakdown_type: issueType || 'engine',
                  }),
              }
            ]
          );
        },
        error => {
          console.error("❌ Location error:", error.message);
          Alert.alert("Error", "Could not get location.");
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } catch (err) {
      console.error("❌ Error fetching mechanics:", err.message);
      Alert.alert("Error", "Could not send breakdown request.");
    }
  };


  const handleAttachImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) return;
      if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSendBreakdownRequest = async () => {
    try {
      // Always get fresh location when opening radar
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      });

      const { latitude, longitude } = position.coords;
      prevCoords.current = { latitude, longitude };
      
      console.log('📍 Got fresh location for radar:', { latitude, longitude });
    setShowRadarModal(true);
      
    } catch (error) {
      console.error("❌ Location error:", error.message);
      Alert.alert("Error", "Could not get location. Please enable GPS.");
    }
  };

  const handleMechanicsFound = (mechanics) => {
    // Handle the mechanics found - you can implement your logic here
    Alert.alert(
      'Request Sent!',
      `Breakdown request sent to ${mechanics.length} mechanics successfully!`,
      [{ text: 'OK' }]
    );
  };

  const handleNoMechanicsFound = (fetchedMechanics) => {
    // Show alert first
    Alert.alert(
      "No One Accepted Request",
      "No one accepted the request. Try sending request to nearby mechanics.",
      [
        {
          text: "OK",
          onPress: () => {
            // After user clicks OK, navigate to FoundMechanic with fetched mechanics
            if (fetchedMechanics && fetchedMechanics.length > 0) {
              // Use the mechanics that were fetched during radar scan
              navigation.navigate('FoundMechanic', {
                lat: prevCoords.current?.latitude || 0,
                lon: prevCoords.current?.longitude || 0,
                breakdown_type: issueType || 'engine',
                isFallback: true,
                preFetchedMechanics: fetchedMechanics // Pass the mechanics
              });
            } else {
              // Fallback: fetch mechanics again if none were fetched during radar
              Geolocation.getCurrentPosition(
                async position => {
                  const { latitude, longitude } = position.coords;
                  
                  try {
                    const response = await axios.post('http://10.0.2.2:8000/api/recommendations/', {
                      lat: latitude,
                      lon: longitude,
                      breakdown_type: issueType || 'engine',
                    });

                    const mechList = response.data.mechanics;
                    await AsyncStorage.setItem('topMechanics', JSON.stringify(mechList));
                    setMechanics(mechList);
                    
            navigation.navigate('FoundMechanic', {
                      lat: latitude,
                      lon: longitude,
                      breakdown_type: issueType || 'engine',
                      isFallback: true
                    });
                    
                  } catch (err) {
                    console.error("❌ Error fetching mechanics:", err.message);
                    Alert.alert("Error", "Could not fetch nearby mechanics.");
                  }
                },
                error => {
                  console.error("❌ Location error:", error.message);
                  Alert.alert("Error", "Could not get location.");
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
              );
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]} style={styles.gradient}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()} style={styles.backArrow}>
          <Image source={arrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', position: 'relative' }}>
          <Text style={styles.headerTitle}>Breakdown Request</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.gpsCarSvgContainer}>
              <View style={styles.gpsCarBody} />
              <View style={styles.gpsCarRoof} />
              <View style={styles.gpsCarWheelContainer}>
                <View style={styles.gpsCarWheel} />
                <View style={styles.gpsCarWheel} />
              </View>
            </View>
            <Text style={styles.cardTitle}>Complete Car Details</Text>
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Car Model"
              value={carModel}
              onChangeText={setCarModel}
              placeholderTextColor="#b0b3c6"
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholderTextColor="#b0b3c6"
            />
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholderTextColor="#b0b3c6"
            />
          </View>
          {/* Dropdown for Issue Type */}
          <TouchableOpacity
            style={[styles.input, styles.dropdown]}
            onPress={() => setShowDropdown(!showDropdown)}
            activeOpacity={0.8}
          >
            <Text style={{ color: issueType === issueTypes[0] ? '#b0b3c6' : '#22223B', fontSize: 17 }}>{issueType}</Text>
            <Image
              source={downArrow}
              style={[styles.downArrowIcon, showDropdown && { transform: [{ rotate: '180deg' }] }]}
            />
          </TouchableOpacity>
          {showDropdown && (
            <View style={styles.dropdownList}>
              {issueTypes.slice(1).map((type, idx) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => { setIssueType(type); setShowDropdown(false); }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe the problem in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#b0b3c6"
          />
          {/* Attach Image Button and Preview */}
          <View style={styles.attachImageRow}>
            <TouchableOpacity style={styles.attachImageBtn} onPress={handleAttachImage} activeOpacity={0.8}>
              <Image source={photoCamera} style={styles.attachImageIcon} />
              <Text style={styles.attachImageText}>Attach Image</Text>
            </TouchableOpacity>
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage}>
                  <Icon name="close-circle" size={20} color="#FF4D4F" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendBreakdownRequest} activeOpacity={0.85}>
            <Text style={styles.sendBtnText}>Send Breakdown Request</Text>
          </TouchableOpacity>
        </View>
        {/* {mechanics.length > 0 && (
          <View style={{ marginTop: 0, paddingHorizontal: 22, width: '92%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#22223B' }}>
              Top Recommended Mechanics:
            </Text>
            {mechanics.map((mech, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#f2f2f2',
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 12,
                  borderColor: '#ddd',
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{mech.mech_name}</Text>
                <Text style={{ color: '#444' }}>Rating: {mech.rating}</Text>
                <Text style={{ color: '#444' }}>
                  Distance: {mech.road_distance_km?.toFixed(2)} km
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    backgroundColor: '#FF5E5E',
                    padding: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => {
                    // Optional: Add logic to send request to this mechanic
                    console.log(`Send request to: ${mech.mech_name}`);
                  }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Send Request</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )} */}
      </ScrollView>
      {/* Radar Modal */}
      <RadarModal
  visible={showRadarModal}
  onClose={() => setShowRadarModal(false)}
  onNoMechanicsFound={handleNoMechanicsFound}
  user={loggedInUser}
  userLocation={prevCoords.current ? {
    lat: prevCoords.current.latitude,
    lon: prevCoords.current.longitude
  } : { lat: 0, lon: 0 }}
  breakdownType={issueType}
  carDetails={{
    carModel,
    year,
    licensePlate,
    description,
    issueType,
    image: selectedImage?.uri || null
  }}
/>


    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
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
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: -20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    width: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 18,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#f6f8ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
    marginBottom: 14,
    position: 'relative',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    marginTop: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginRight: 0,
    marginBottom: 18,
    fontSize: 17,
  },
  sendBtn: {
    backgroundColor: '#ff5c5c',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff5c5c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  gpsCarSvgContainer: {
    width: 48,
    height: 28,
    marginRight: 8,
    alignSelf: 'center',
  },
  gpsCarBody: {
    position: 'absolute',
    bottom: 6,
    width: 48,
    height: 14,
    backgroundColor: '#E53935',
    borderRadius: 3,
  },
  gpsCarRoof: {
    position: 'absolute',
    top: 0,
    left: 9,
    width: 30,
    height: 10,
    backgroundColor: '#92A5A6',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  gpsCarWheelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpsCarWheel: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  downArrowIcon: {
    width: 16,
    height: 16,
    position: 'absolute',
    right: 16,
    top: 14,
    resizeMode: 'contain',
    tintColor: '#FF4D4F',
  },
  attachImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
    gap: 10,
  },
  attachImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#FF4D4F',
  },
  attachImageText: {
    color: '#FF4D4F',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  attachImageIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    resizeMode: 'contain',
    tintColor: '#FF4D4F',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  imagePreview: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  removeImageBtn: {
    marginLeft: 2,
  },
  messageContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  messageText: {
    color: '#DC2626',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});

export default Breakdown; 