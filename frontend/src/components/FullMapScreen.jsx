import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import SearchMechanicBar from './SearchMechanicBar';
import { useNavigation } from '@react-navigation/native';
import arrowIcon from '../images/arrow.png'; // Adjust path if needed
import LinearGradient from 'react-native-linear-gradient';
import searchIcon from '../images/search.png'; // Added for search icon
import microphoneIcon from '../images/microphone.png'; // Added for microphone icon
import Geolocation from '@react-native-community/geolocation'; // or 'expo-location' for Expo

const FullMapScreen = () => {
  const [search, setSearch] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [showCallout, setShowCallout] = useState(false);
  // Optionally, add focus/blur handlers if needed
  const navigation = useNavigation();

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.log(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    };
    getLocation();
  }, []);

  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (error) {
      return 'Address not found';
    }
  };

  const handleMarkerPress = async () => {
    if (currentLocation) {
      const addr = await getAddressFromCoords(
        currentLocation.latitude,
        currentLocation.longitude
      );
      setAddress(addr);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f7cac9', '#f3e7e9', '#a1c4fd']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image source={arrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        {/* Centered Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Map</Text>
        </View>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Image source={searchIcon} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanic"
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
            onFocus={() => {}}
            onBlur={() => {}}
          />
          <TouchableOpacity style={styles.microphoneBtn}>
            <Image source={microphoneIcon} style={styles.microphoneIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <MapView
        style={styles.map}
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : {
                latitude: 23.0225,
                longitude: 72.5714,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
        showsUserLocation={true}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            onPress={handleMarkerPress}
          >
            <Callout>
              <View style={{ width: 200 }}>
                <Text style={{ fontWeight: 'bold' }}>Current Location</Text>
                <Text>{address ? address : 'Tap marker to load address...'}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  headerGradient: {
    borderRadius: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 0,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'relative',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  backArrow: {
    position: 'absolute',
    left: 16,
    top: 56, // match your paddingTop
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56, // match your paddingTop
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: -3,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginBottom:-20,
    marginTop: 50, // add enough margin to push below the title
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E53935',
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#22223B',
  },
  microphoneBtn: {
    marginLeft: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  backArrowIcon: {
    width: 24,      // or 20, or whatever size you want
    height: 24,
    resizeMode: 'contain',
    tintColor: '#FF4D4F', // or your preferred color
  },
});

export default FullMapScreen;
