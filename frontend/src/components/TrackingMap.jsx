import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Linking, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomText from '../../Components/CustomText';
import backArrowIcon from '../images/arrow.png';
import { Image } from 'react-native';
import axios from 'axios';


const { width, height } = Dimensions.get('window');

// ========================================
// GOOGLE MAPS API CONFIGURATION
// ========================================
// Using Google Maps API key from backend environment
// API Key: AIzaSyCXh9MnXWYOgiBPNkOSz2kzIDOhNTDcHMI
// The following APIs are enabled in your Google Cloud Console:
// - Maps SDK for Android
// - Maps SDK for iOS  
// - Directions API
// - Geocoding API
// 
// Route Optimization: Set to find shortest distance routes
// ========================================

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default function TrackingMap({ navigation, route }) {
  const userCoords = route.params?.user_coords || {};
  const garageCoords = route.params?.garage_coords || {};
  const assigned = route.params?.assigned_worker || {};
  
  // Google Maps API key sourced from backend/.env file
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapType, setMapType] = useState('standard');

  // Google Maps API Key - Replace with your actual API key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCXh9MnXWYOgiBPNkOSz2kzIDOhNTDcHMI';

  // Google Maps custom styling for real map appearance
  const mapStyle = [
    {
      "featureType": "all",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f8f9fa"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#e0e0e0"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#5a5a5a"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#424242"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9d7e6"
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f2"
        }
      ]
    },
    {
      "featureType": "building",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f0f0f0"
        }
      ]
    }
  ];

  // Fetch real route from Google Maps Directions API
  const fetchGoogleMapsRoute = async () => {
    if (!userCoords?.lat || !garageCoords?.lat) return;
    
    try {
      const userLat = Number(userCoords.lat);
      const userLon = Number(userCoords.lon);
      const garageLat = Number(garageCoords.lat);
      const garageLon = Number(garageCoords.lon);
      
      if (isNaN(userLat) || isNaN(userLon) || isNaN(garageLat) || isNaN(garageLon)) {
        return;
      }

      // Use Google Maps Directions API for real routing
      const origin = `${userLat},${userLon}`;
      const destination = `${garageLat},${garageLon}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&alternatives=true&optimize=true&mode=driving`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.status === 'OK' && response.data.routes && response.data.routes[0]) {
        // Find the route with shortest distance
        let shortestRoute = response.data.routes[0];
        let shortestDistance = parseFloat(shortestRoute.legs[0].distance.text.replace(' km', '').replace(',', ''));
        
        // Check all alternative routes for shortest distance
        response.data.routes.forEach(route => {
          const distance = parseFloat(route.legs[0].distance.text.replace(' km', '').replace(',', ''));
          if (distance < shortestDistance) {
            shortestDistance = distance;
            shortestRoute = route;
          }
        });
        
        const route = shortestRoute;
        const leg = route.legs[0];
        
        // Decode the polyline to get coordinates
        const points = route.overview_polyline.points;
        const coordinates = decodePolyline(points);
        
        setRouteCoordinates(coordinates);
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps
        });
      }
    } catch (error) {
      // Fallback to simple route if Google Maps API fails
      const simpleRoute = [
        { latitude: Number(userCoords.lat), longitude: Number(userCoords.lon) },
        { latitude: Number(garageCoords.lat), longitude: Number(garageCoords.lon) }
      ];
      
      setRouteCoordinates(simpleRoute);
      setRouteInfo({
        distance: haversine(
          Number(userCoords.lat), 
          Number(userCoords.lon), 
          Number(garageCoords.lat), 
          Number(garageCoords.lon)
        ).toFixed(1) + ' km',
        duration: 'Unknown',
        steps: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Decode Google Maps polyline
  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5
      });
    }
    return poly;
  };

  useEffect(() => {
    fetchGoogleMapsRoute();
  }, [userCoords, garageCoords]);

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const centerOnUser = () => {
    // This will be handled by the map's showsMyLocationButton
  };

  const getMapStyle = () => {
    if (mapType === 'satellite') {
      return {
        // Custom satellite-like styling
        backgroundColor: '#1a1a1a',
      };
    }
    return {
      // Standard OSM-like styling
      backgroundColor: '#f8f9fa',
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>Track Mechanic</CustomText>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          style={[styles.map, getMapStyle()]}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: Number(userCoords.lat) || 22.991227,
            longitude: Number(userCoords.lon) || 72.488415,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          mapType={mapType}
          userLocationPriority="high"
          userLocationUpdateInterval={5000}
          userLocationFastestInterval={2000}
          followsUserLocation={false}
          customMapStyle={mapStyle}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          showsIndoorLevelPicker={false}
          showsPointsOfInterest={true}
          showsScale={true}
          showsZoomControls={true}
          zoomEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          minZoomLevel={10}
          maxZoomLevel={20}
        >
          {/* User Location Marker */}
          {!!userCoords?.lat && !!userCoords?.lon && !isNaN(Number(userCoords.lat)) && !isNaN(Number(userCoords.lon)) && (
            <Marker
              coordinate={{ 
                latitude: Number(userCoords.lat), 
                longitude: Number(userCoords.lon) 
              }}
              title="Your Location"
              description="Start point"
              pinColor="#10B981"
            />
          )}

          {/* Garage Location Marker */}
          {!!garageCoords?.lat && !!garageCoords?.lon && !isNaN(Number(garageCoords.lat)) && !isNaN(Number(garageCoords.lon)) && (
            <Marker
              coordinate={{ 
                latitude: Number(garageCoords.lat), 
                longitude: Number(garageCoords.lon) 
              }}
              title={assigned?.garage_name || 'Garage'}
              description="Destination"
              pinColor="#EF4444"
            />
          )}

          {/* Real Route Path */}
          {routeCoordinates && routeCoordinates.length >= 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#4285F4"
              strokeWidth={6}
              zIndex={1}
              tappable={true}
              geodesic={true}
            />
          )}
        </MapView>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <CustomText style={styles.loadingText}>Calculating route...</CustomText>
          </View>
        )}

        {/* Route Info Card */}
        {routeInfo && routeCoordinates && (
          <View style={styles.routeInfoCard}>
            <View style={styles.routeHeader}>
              <CustomText style={styles.routeTitle}>Route Information</CustomText>
              <TouchableOpacity style={styles.refreshButton} onPress={fetchGoogleMapsRoute}>
                <Text style={styles.refreshIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.routeDetails}>
              <View style={styles.routeDetail}>
                <Text style={styles.detailIcon}>📏</Text>
                <CustomText style={styles.detailText}>{routeInfo.distance}</CustomText>
              </View>
              <View style={styles.routeDetail}>
                <Text style={styles.detailIcon}>⏱️</Text>
                <CustomText style={styles.detailText}>{routeInfo.duration}</CustomText>
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity 
                style={[styles.contactBtn, styles.callBtn]}
                onPress={() => {
                  console.log('📞 Call button pressed in TrackingMap. Available data:', {
                    assigned,
                    worker_phone: assigned?.worker_phone,
                    mech_phone: assigned?.mech_phone,
                    phone: assigned?.phone
                  });
                  
                  // Try multiple possible phone number fields
                  const phoneToCall = assigned?.worker_phone || assigned?.mech_phone || assigned?.phone;
                  
                  if (phoneToCall && phoneToCall !== 'N/A') {
                    Linking.openURL(`tel:${phoneToCall}`);
                  } else {
                    Alert.alert('Error', 'Phone number not available');
                  }
                }}
              >
                <Text style={styles.contactBtnIcon}>📞</Text>
                <CustomText style={[styles.contactBtnText, styles.callBtnText]}>Call</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FF4D4F',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapTypeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTypeIcon: {
    fontSize: 24,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  routeInfoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  refreshIcon: {
    fontSize: 20,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  routeDetail: {
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  contactButtons: {
    alignItems: 'center',
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  callBtn: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    minWidth: 120,
  },
  contactBtnIcon: {
    fontSize: 18,
  },
  contactBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  callBtnText: {
    color: '#ffffff',
  },
}); 