import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Modal, Pressable, Keyboard, Animated, Alert, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import locIcon from '../images/loc.png';
import settingIcon from '../images/setting.png';
import user2Icon from '../images/user2.png';
import carIcon from '../images/car.png';
import chatIcon from '../images/chat.png';
import sosIcon from '../images/sos.png';
import padlockIcon from '../images/padlock.png';
import hiIcon from '../images/hi.png';
import phoneIcon from '../images/phone.png';
import emergencyIcon from '../images/emergency-call.png';
import engineerIcon from '../images/engineer.png';
import serviceIcon from '../images/customer-service.png';
import accumulatorIcon from '../images/accumulator.png';
import microphoneIcon from '../images/microphone.png';
import boltIcon from '../images/bolt.png';
import messageIcon from '../images/message.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import LiveMap from './LiveMap';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation'; // or 'expo-location' for Expo
import { PermissionsAndroid, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import SOSButtonOverlay from './SOSButtonOverlay';

/**
 * UserHome Component
 * 
 * Features:
 * - Main user dashboard with quick services and mechanic search
 * - Floating box that appears when a worker is assigned to the user
 * - Real-time updates for assigned worker status
 * - Navigation to AssignedMech component for detailed worker information
 * - Automatic polling every 10 seconds to check for new assignments
 * - Error handling with retry functionality
 * - Smooth animations for floating box appearance/disappearance
 * 
 * Floating Box Features:
 * - Shows assigned worker name, garage, and issue type
 * - View button navigates to AssignedMech component
 * - Close button to dismiss the floating box
 * - Pulsing status dot to indicate active assignment
 * - Long press shows additional options (call worker, view details)
 * - Positioned above tab bar for easy access
 */
const serviceIcons = {
  breakdown: require('../images/img1.png'),
  fuel: require('../images/img2.png'),
  towing: require('../images/img3.png'),
  battery: accumulatorIcon,
};

const mechanicData = [
  { id: '1', name: 'John Doe', mobile: '9876543210' },
  { id: '2', name: 'Jane Smith', mobile: '9123456789' },
  { id: '3', name: 'Mike Johnson', mobile: '9988776655' },
  { id: '4', name: 'Emily Brown', mobile: '9001122334' },
];



const HEADER_HEIGHT = 140; // Increased to fit search bar and results

const UserHome = ({
  onFastConnection,
  onLiveChat,
  onBreakdown,
  onFuelDelivery,
  onTowing,
  onBattery,
}) => {
 
  const theme = lightTheme;

  // Search state
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  // Remove modal and selectedMechanic state
  const [searchFocused, setSearchFocused] = useState(false);
  // Change showResults logic to show dropdown and blur overlay on focus, even if search is empty
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add a ref and state to measure the search bar position
  const searchBarRef = useRef(null);
  const [searchBarY, setSearchBarY] = useState(0);
  const [searchBarHeight, setSearchBarHeight] = useState(0);

  // Add state to track dropdown height
  const [dropdownHeight, setDropdownHeight] = useState(0);

  // Contact Mechanic handler - navigate to Breakdown page
  const handleContactMechanic = () => {
    navigation.navigate('Breakdown');
  };

  // Filter mechanics
  const filteredMechanics = mechanicData.filter(
    m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search)
  );

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [noResultAnim] = useState(new Animated.Value(0));

  // Add state for assigned worker floating box
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [isLoadingWorker, setIsLoadingWorker] = useState(false);
  const [workerError, setWorkerError] = useState(null);
  const [floatingBoxAnim] = useState(new Animated.Value(0));
  const [statusDotAnim] = useState(new Animated.Value(1));

  // Add state for recent mechanics from auth_mech collection
  const [recentMechanics, setRecentMechanics] = useState([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(false);
  const [spinnerAnim] = useState(new Animated.Value(0));

  // Debug: Log when assignedWorker changes
  useEffect(() => {
    console.log('🔄 assignedWorker state changed:', assignedWorker);
  }, [assignedWorker]);

  // Animate floating box when it appears/disappears
  useEffect(() => {
    if (assignedWorker) {
      Animated.spring(floatingBoxAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      // Start pulsing animation for status dot
      Animated.loop(
        Animated.sequence([
          Animated.timing(statusDotAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(statusDotAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Add bounce animation for badge
      Animated.sequence([
        Animated.timing(statusDotAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(statusDotAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(floatingBoxAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Stop pulsing animation
      statusDotAnim.stopAnimation();
    }
  }, [assignedWorker]);

  useEffect(() => {
    if (dropdownOpen && filteredMechanics.length === 0 && search) {
      Animated.timing(noResultAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      noResultAnim.setValue(0);
    }
  }, [dropdownOpen, filteredMechanics.length, search]);

  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sosVisible, setSosVisible] = useState(false);

  // Function to fetch user's active request with assigned worker
  const fetchActiveRequest = async () => {
    if (!user?._id) {
      console.log('❌ No user ID available for fetchActiveRequest');
      return;
    }
    
    console.log('🔍 Fetching active request for user:', user._id);
    setIsLoadingWorker(true);
    setWorkerError(null);
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log('🔑 Token available:', !!token);

      // 1) Check a persisted lastRequestId first for a precise state
      try {
        const lastRequestId = await AsyncStorage.getItem('lastRequestId');
        if (lastRequestId) {
          console.log('🗃️ Found lastRequestId in storage:', lastRequestId);
          const det = await API.get(`request-detail/${lastRequestId}/`, { headers: { Authorization: `Bearer ${token}` }});
          if (det?.data?.status === 'success' && det?.data?.request) {
            const req = det.data.request;
            
            // If any mechanic has completed this request, clear box immediately
            const anyCompleted = Array.isArray(req.mechanics_list) && req.mechanics_list.some(m => m.status === 'completed');
            if (anyCompleted) {
              console.log('✅ Request completed by mechanic, clearing floating box');
              setAssignedWorker(null);
              return;
            }
            
            const hasAssignedWorker = !!req.assigned_worker;
            const hasAccepted = Array.isArray(req.mechanics_list) && req.mechanics_list.some(m => m.status === 'accepted');
            const isAssignedStatus = req.status === 'assigned';
            const notCompleted = req.status !== 'completed';
            if ((hasAssignedWorker || hasAccepted || isAssignedStatus) && notCompleted && String(req.user_id) === String(user._id)) {
              const acceptedMechanic = req.mechanics_list.find(m => m.status === 'accepted');
              const workerData = {
                worker_id: req.assigned_worker?.worker_id || acceptedMechanic?.mech_id,
                worker_name: req.assigned_worker?.worker_name || acceptedMechanic?.mech_name || 'Assigned Mechanic',
                worker_phone: req.assigned_worker?.worker_phone || acceptedMechanic?.mech_phone || 'N/A',
                garage_name: req.assigned_worker?.garage_name || acceptedMechanic?.mech_name || 'Garage',
                request_id: req._id,
                user_coords: { lat: req.lat, lon: req.lon },
                garage_coords: req.garage_coords || req.assigned_worker?.garage_coords || null,
                user_name: req.user_name,
                user_phone: req.user_phone,
                breakdown_type: req.breakdown_type,
                car_model: req.car_model,
                year: req.year,
                license_plate: req.license_plate,
                description: req.description,
                issue_type: req.issue_type,
                road_distance: acceptedMechanic?.road_distance_km || 'N/A',
                otp_code: req.otp_code || '----'  // Add OTP from request
              };
              console.log('✅ Using precise request-detail data to set box');
              setAssignedWorker(workerData);
              return; // short-circuit; we have definitive active assignment
            }
          }
        }
      } catch (preciseErr) {
        console.log('ℹ️ request-detail precise check failed/ignored:', preciseErr);
      }
      
      // 2) Fallback to broader lists as before
      // Try to get user's active requests using a more generic approach
      // 2a) Query a dedicated user-active-request endpoint first
      try {
        const ua = await API.get(`user-active-request/?user_id=${user._id}`, { headers: { Authorization: `Bearer ${token}` }});
        if (ua?.data?.status === 'success' && ua?.data?.request) {
          const r = ua.data.request;
          
          // If any mechanic has completed this request, clear box immediately
          const anyCompleted = Array.isArray(r.mechanics_list) && r.mechanics_list.some(m => m.status === 'completed');
          if (anyCompleted) {
            console.log('✅ Request completed by mechanic (from user-active-request), clearing floating box');
            setAssignedWorker(null);
            return;
          }
          
          const acceptedMechanic = Array.isArray(r.mechanics_list) ? r.mechanics_list.find(m => m.status === 'accepted' || m.status === 'assigned') : null;
          const workerData = {
            worker_id: r.assigned_worker?.worker_id || acceptedMechanic?.mech_id,
            worker_name: r.assigned_worker?.worker_name || acceptedMechanic?.mech_name || 'Assigned Mechanic',
            worker_phone: r.assigned_worker?.worker_phone || acceptedMechanic?.mech_phone || 'N/A',
            garage_name: r.assigned_worker?.garage_name || acceptedMechanic?.mech_name || 'Garage',
            request_id: r._id,
            user_coords: { lat: r.lat, lon: r.lon },
            garage_coords: r.garage_coords || r.assigned_worker?.garage_coords || null,
            user_name: r.user_name,
            user_phone: r.user_phone,
            breakdown_type: r.breakdown_type,
            car_model: r.car_model,
            year: r.year,
            license_plate: r.license_plate,
            description: r.description,
            issue_type: r.issue_type,
            road_distance: acceptedMechanic?.road_distance_km || 'N/A',
            otp_code: r.otp_code || '----'  // Add OTP from request
          };
          setAssignedWorker(workerData);
          return;
        }
      } catch (uae) { /* ignore and continue */ }

      const response = await API.get('pending-requests/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 API Response:', response.data);
      
      if (response.data.status === 'success' && response.data.requests) {
        console.log('✅ Found requests:', response.data.requests.length);
        const userRequest = response.data.requests.find(req => {
          const hasUserMatch = String(req.user_id) === String(user._id);
          const hasMechanicsList = Array.isArray(req.mechanics_list) && req.mechanics_list.length > 0;
          const hasAcceptedMechanic = hasMechanicsList && req.mechanics_list.some(mech => mech.status === 'accepted');
          const hasAssignedWorker = !!req.assigned_worker;
          const isAssignedStatus = req.status === 'assigned';
          const notCompleted = !req.mechanics_list.some(mech => mech.status === 'completed');
          return hasUserMatch && (hasAssignedWorker || hasAcceptedMechanic || isAssignedStatus) && notCompleted;
        });
        
        if (userRequest) {
          const acceptedMechanic = userRequest.mechanics_list.find(mech => mech.status === 'accepted');
          const workerData = {
            worker_id: userRequest.assigned_worker?.worker_id || acceptedMechanic?.mech_id,
            worker_name: userRequest.assigned_worker?.worker_name || acceptedMechanic?.mech_name || 'Assigned Mechanic',
            worker_phone: userRequest.assigned_worker?.worker_phone || acceptedMechanic?.mech_phone || 'N/A',
            garage_name: userRequest.assigned_worker?.garage_name || acceptedMechanic?.mech_name || 'Garage',
            request_id: userRequest._id,
            user_coords: { lat: userRequest.lat, lon: userRequest.lon },
            garage_coords: userRequest.garage_coords || { lat: userRequest.lat, lon: userRequest.lon },
            user_name: userRequest.user_name,
            user_phone: userRequest.user_phone,
            breakdown_type: userRequest.breakdown_type,
            car_model: userRequest.car_model,
            year: userRequest.year,
            license_plate: userRequest.license_plate,
            description: userRequest.description,
            issue_type: userRequest.issue_type,
            road_distance: acceptedMechanic?.road_distance_km || 'N/A',
            otp_code: userRequest.otp_code || '----'  // Add OTP from request
          };
          setAssignedWorker(workerData);
        } else {
          setAssignedWorker(null);
        }
      } else {
        // Keep the older fallbacks intact
        try {
          const assignedResponse = await API.get(`assigned-requests/?user_id=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (assignedResponse.data.status === 'success' && assignedResponse.data.requests) {
            const activeRequest = assignedResponse.data.requests.find(req => req.status === 'assigned' || (Array.isArray(req.mechanics_list) && req.mechanics_list.some(m => m.status === 'accepted')) || (req.status && req.status !== 'completed'));
            if (activeRequest) {
              const acceptedMechanic = activeRequest.mechanics_list?.find(mech => mech.status === 'accepted');
              const workerData = {
                worker_id: activeRequest.assigned_worker?.worker_id || acceptedMechanic?.mech_id,
                worker_name: activeRequest.assigned_worker?.worker_name || acceptedMechanic?.mech_name || 'Assigned Mechanic',
                worker_phone: activeRequest.assigned_worker?.worker_phone || acceptedMechanic?.mech_phone || 'N/A',
                garage_name: activeRequest.assigned_worker?.garage_name || acceptedMechanic?.mech_name || 'Garage',
                request_id: activeRequest._id,
                user_coords: { lat: activeRequest.lat, lon: activeRequest.lon },
                garage_coords: activeRequest.garage_coords || { lat: activeRequest.lat, lon: activeRequest.lon },
                user_name: activeRequest.user_name,
                user_phone: activeRequest.user_phone,
                breakdown_type: activeRequest.breakdown_type,
                car_model: activeRequest.car_model,
                year: activeRequest.year,
                license_plate: activeRequest.license_plate,
                description: activeRequest.description,
                issue_type: activeRequest.issue_type,
                road_distance: acceptedMechanic?.road_distance_km || 'N/A',
                otp_code: activeRequest.otp_code || '----'  // Add OTP from request
              };
              setAssignedWorker(workerData);
            } else {
              setAssignedWorker(null);
            }
          } else {
            setAssignedWorker(null);
          }
        } catch (assignedError) {
          console.log('❌ No assigned requests found:', assignedError);
          try {
            const anyResponse = await API.get(`user-requests/`, { headers: { Authorization: `Bearer ${token}` } });
            if (anyResponse.data && anyResponse.data.length > 0) {
              const userRequest = anyResponse.data.find(req => String(req.user_id) === String(user._id) && ((Array.isArray(req.mechanics_list) && req.mechanics_list.some(mech => mech.status === 'accepted')) || !!req.assigned_worker || req.status === 'assigned'));
              if (userRequest) {
                const acceptedMechanic = userRequest.mechanics_list.find(mech => mech.status === 'accepted');
                const workerData = {
                  worker_id: acceptedMechanic?.mech_id,
                  worker_name: acceptedMechanic?.mech_name || 'Assigned Mechanic',
                  worker_phone: acceptedMechanic?.mech_phone || 'N/A',
                  garage_name: acceptedMechanic?.mech_name || 'Garage',
                  request_id: userRequest._id,
                  user_coords: { lat: userRequest.lat, lon: userRequest.lon },
                  garage_coords: userRequest.garage_coords || { lat: userRequest.lat, lon: userRequest.lon },
                  user_name: userRequest.user_name,
                  user_phone: userRequest.user_phone,
                  breakdown_type: userRequest.breakdown_type,
                  car_model: userRequest.car_model,
                  year: userRequest.year,
                  license_plate: userRequest.license_plate,
                  description: userRequest.description,
                  issue_type: userRequest.issue_type,
                  road_distance: acceptedMechanic?.road_distance_km || 'N/A',
                  otp_code: userRequest.otp_code || '----'  // Add OTP from request
                };
                setAssignedWorker(workerData);
              } else {
                setAssignedWorker(null);
              }
            } else {
              setAssignedWorker(null);
            }
          } catch (anyError) {
            console.log('❌ No user requests found at all:', anyError);
            setAssignedWorker(null);
          }
        }
      }
    } catch (error) {
      console.log('❌ Error fetching assigned worker:', error);
      setWorkerError('Failed to fetch assignment data');
      setAssignedWorker(null);
    } finally {
      setIsLoadingWorker(false);
    }
  };

    // Function to fetch recent mechanics from database
  const fetchRecentMechanics = async () => {
    console.log('🔍 Fetching recent mechanics from database');
    setIsLoadingMechanics(true);
    
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('❌ No token available for fetching mechanics');
        setRecentMechanics([]);
        return;
      }

      // Try the new mechanics endpoint first (which should work)
      let mechanicsData = null;
      
      try {
        console.log('📡 Trying GET /mechanics/ endpoint...');
        console.log('📡 Calling with user_id:', user?._id);
        const response = await API.get(`mechanics/?user_id=${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📡 Mechanics API Response:', response.data);
        
        if (response.data?.status === 'success' && response.data?.mechanics) {
          mechanicsData = response.data.mechanics;
          console.log('✅ Successfully fetched mechanics from /mechanics/ endpoint:', response.data.count);
          console.log('👤 Found mechanics for user:', response.data.user_name);
        }
      } catch (error) {
        console.log('❌ /mechanics/ endpoint failed:', error.message);
        console.log('❌ Error details:', error.response?.data || error.response?.status || 'No response data');
        console.log('❌ Full error:', error);
      }

      // If mechanics endpoint fails, try fallback approaches
      if (!mechanicsData) {
        // Try to get from the last known request (which we know works)
        try {
          console.log('📡 Trying to get mechanics from last known request...');
          const lastRequestId = await AsyncStorage.getItem('lastRequestId');
          
          if (lastRequestId) {
            const response2 = await API.get(`request-detail/${lastRequestId}/`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('📡 Request-detail API Response:', response2.data);
            
            if (response2.data?.status === 'success' && response2.data?.request) {
              const request = response2.data.request;
              
              if (request.mechanics_list && Array.isArray(request.mechanics_list)) {
                const mechanicsFromDetail = request.mechanics_list.map(mech => ({
                  _id: mech.mech_id,
                  username: mech.mech_name,
                  phone: mech.mech_phone,
                  garage_name: mech.mech_name,
                  address: 'Address from request detail',
                  active_mech: true
                }));
                
                if (mechanicsFromDetail.length > 0) {
                  mechanicsData = mechanicsFromDetail;
                  console.log('✅ Found mechanics from request-detail endpoint:', mechanicsFromDetail.length);
                }
              }
            }
          }
        } catch (error) {
          console.log('❌ request-detail endpoint failed:', error.message);
        }
      }

      // Process the mechanics data
      if (mechanicsData && Array.isArray(mechanicsData)) {
        console.log('🔧 Processing mechanics data:', mechanicsData.length, 'items');
        
        // Filter only active mechanics and take the first 5
        const activeMechanics = mechanicsData
          .filter(mech => mech.active_mech === true)
          .slice(0, 5)
          .map(mech => ({
            id: mech._id,
            name: mech.username || 'Unknown Mechanic',
            mobile: mech.phone || 'N/A',
            garage_name: mech.garage_name || 'Unknown Garage',
            address: mech.address || 'Address not available',
            request_count: mech.user_request_count || 0,
            last_service: mech.last_service_type || 'N/A',
            last_date: mech.last_service_date || 'N/A'
          }));
        
        console.log('✅ Found active mechanics:', activeMechanics.length);
        console.log('📋 Final mechanics list:', activeMechanics);
        setRecentMechanics(activeMechanics);
      } else {
        console.log('❌ No mechanics data found or invalid format');
        
        // Final fallback: Use static data from your MongoDB
        console.log('🔄 Using fallback static data from MongoDB');
        const fallbackMechanics = [
          {
            id: 'fallback-1',
            name: 'ABC',
            mobile: '9876543212',
            garage_name: 'Jay Bharat Motors & Auto Consultant',
            address: '1, Highway Estate, Sanand Road, Sarkhej-382210'
          },
          {
            id: 'fallback-2',
            name: 'XYZ',
            mobile: '4678765445',
            garage_name: 'Car Doctor',
            address: 'Sardar Patel Ring Rd, opp. applewood townships, Ahmedabad, Sarkhej-Oka'
          }
        ];
        setRecentMechanics(fallbackMechanics);
      }
    } catch (error) {
      console.log('❌ Error fetching mechanics:', error);
      setRecentMechanics([]);
    } finally {
      setIsLoadingMechanics(false);
    }
  };



  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      const userType = await AsyncStorage.getItem('userType');
      if (token && userType === 'user') {
        try {
          const res = await API.get('users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.log('Failed to fetch user profile', err);
        }
      }
    };
    fetchProfile();
  }, []);

  // Fetch active request when user is available
  useEffect(() => {
    if (user?._id) {
      fetchActiveRequest();
      fetchRecentMechanics(); // Also fetch recent mechanics
      // Set up polling to check for updates every 10 seconds
      const interval = setInterval(fetchActiveRequest, 10000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const navigation = useNavigation();

  // Function to calculate distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    if (!coord1?.lat || !coord1?.lon || !coord2?.lat || !coord2?.lon) return 'N/A';
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  useFocusEffect(
    useCallback(() => {
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
            console.log('Fetched position:', position);
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          error => {
            console.log('Location error:', error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      };
      getLocation(); // <-- This is where location is fetched!
      
      // Also refresh assigned worker data when screen is focused
      if (user?._id) {
        fetchActiveRequest();
        fetchRecentMechanics(); // Also refresh mechanics data
      }
      
      return () => {
        setCurrentLocation(null); // Reset on blur
      };
    }, [user?._id])
  );

  // Animate spinner when loading mechanics
  useEffect(() => {
    if (isLoadingMechanics) {
      Animated.loop(
        Animated.timing(spinnerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinnerAnim.stopAnimation();
    }
  }, [isLoadingMechanics]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
      {/* Search Overlay for blur/black transparent effect */}
      {dropdownOpen && (
        <Pressable
          style={[
            styles.searchOverlay,
            { top: searchBarY + searchBarHeight + dropdownHeight + 8 }
          ]}
          onPress={() => {
            setDropdownOpen(false);
            setSearchFocused(false);
            Keyboard.dismiss();
          }}
        />
      )}
      {/* Mechanic Detail Modal */}
      {/* Remove Modal and related code */}
      {/* Fixed Header */}
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
              <Text style={[styles.greeting, { color: theme.text }]}>
                {user ? `Hello, ${user.username}` : 'Hello!'}
              </Text>
              <Image source={hiIcon} style={{ width: 38, height: 38, marginLeft: 6, marginTop: 2 }} />
            </View>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Welcome back!</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => {
              console.log('🔄 Manual refresh triggered');
              fetchActiveRequest();
            }}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View
          style={styles.searchBarContainer}
          ref={searchBarRef}
          onLayout={event => {
            setSearchBarY(event.nativeEvent.layout.y);
            setSearchBarHeight(event.nativeEvent.layout.height);
          }}
        >
          <Image source={require('../images/search.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanic"
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={text => {
              setSearch(text);
              setShowResults(text.length > 0);
            }}
            onFocus={() => {
              setDropdownOpen(true);
              setSearchFocused(true);
            }}
            onBlur={() => setTimeout(() => {
              setDropdownOpen(false);
              setSearchFocused(false);
            }, 200)}
            autoFocus={false}
          />
          <TouchableOpacity style={styles.microphoneBtn}>
            <Image source={microphoneIcon} style={styles.microphoneIcon} />
          </TouchableOpacity>
        </View>
        {/* Search Results (Vertical List) */}
        {dropdownOpen && (
          <View
            style={[styles.dropdownContainer, { top: searchBarY + searchBarHeight + 8, zIndex: 100 }]}
            onLayout={event => setDropdownHeight(event.nativeEvent.layout.height)}
          >
            {filteredMechanics.length > 0 || !search ? (
              <FlatList
                data={filteredMechanics.length > 0 || search ? filteredMechanics : mechanicData}
                keyExtractor={item => item.id}
                style={{ maxHeight: 220 }}
                renderItem={({ item, index }) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.dropdownRow,
                      highlightedIndex === index && styles.dropdownRowHighlight
                    ]}
                    onPressIn={() => setHighlightedIndex(index)}
                    onPressOut={() => setHighlightedIndex(-1)}
                    onHoverIn={() => setHighlightedIndex(index)}
                    onHoverOut={() => setHighlightedIndex(-1)}
                  >
                    <Image source={require('../images/user.png')} style={styles.dropdownIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{item.name}</Text>
                      <Text style={styles.dropdownMobile}>{item.mobile}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.callIconBtn}
                      onPress={() => {
                        if (item.mobile && item.mobile !== 'N/A') {
                          Linking.openURL(`tel:${item.mobile}`);
                        } else {
                          Alert.alert('No Phone Number', 'This mechanic does not have a phone number available.');
                        }
                      }}
                    >
                      <Image source={phoneIcon} style={styles.callIcon} />
                    </TouchableOpacity>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Animated.View style={{ opacity: noResultAnim }}>
                <View style={styles.dropdownRow}>
                  <Text style={styles.noResultText}>No results found</Text>
                </View>
              </Animated.View>
            )}
          </View>
        )}
      </LinearGradient>
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: HEADER_HEIGHT + 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Location Section */}
        <View style={[styles.section, styles.gpsSection]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={locIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>GPS LOCATION</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={[styles.card, styles.gpsCard]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Image source={locIcon} style={styles.gpsIcon} />
              <Text style={styles.gpsTitle}>GPS Location</Text>
              <View style={styles.statusDot} />
              <Text style={styles.statusActive}>Active</Text>
              <View style={{ flex: 1 }} />
              {/* Car SVG */}
              <View style={styles.gpsCarSvgContainer}>
                <View style={styles.gpsCarBody} />
                <View style={styles.gpsCarRoof} />
                <View style={styles.gpsCarWheelContainer}>
                  <View style={styles.gpsCarWheel} />
                  <View style={styles.gpsCarWheel} />
                </View>
              </View>
            </View>
            <Text style={styles.gpsSubTitle}>Current Location: Detected</Text>
            <Text style={styles.gpsDesc}>Your location is being tracked for emergency assistance</Text>
            
            {/* Map Container */}
            <TouchableOpacity onPress={() => navigation.navigate('FullMap')}>
              <View style={styles.mapContainer}>
                {currentLocation ? (
                  <MapView
                    key={`${currentLocation.latitude},${currentLocation.longitude}`}
                    style={styles.map}
                    region={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                  >
                    <Marker
                      coordinate={currentLocation}
                      title="You are here"
                    />
                  </MapView>
                ) : (
                  <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>Loading map...</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={emergencyIcon} style={[styles.sectionIcon,styles.emergencyStyle]} />
            <Text style={styles.sectionHeader}>EMERGENCY</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.emergencyContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 }}>
              <View style={[styles.actionCard, styles.sosCard]}>
                <Image source={sosIcon} style={styles.actionIcon} />
                <Text style={styles.actionTitle}>Emergency SOS</Text>
                <Text style={styles.actionDesc}>Immediate help for critical situations</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setSosVisible(true)}>
                  <Text style={styles.actionBtnText}>Call SOS</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.actionCard, styles.mechanicCard]}>
                <Image source={chatIcon} style={styles.actionIcon} />
                <Text style={styles.actionTitle}>Contact Mechanic</Text>
                <Text style={styles.actionDesc}>Connect with nearby mechanics</Text>
                <TouchableOpacity style={styles.actionBtnOutline} onPress={handleContactMechanic}>
                  <Text style={styles.actionBtnOutlineText}>Find Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Mechanics Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={require('../images/history.png')} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>RECENT MECHANICS</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity 
              style={styles.sectionRefreshBtn} 
              onPress={fetchRecentMechanics}
              disabled={isLoadingMechanics}
            >
              <Text style={styles.sectionRefreshBtnText}>
                {isLoadingMechanics ? '⟳' : '⟳'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.recentMechContainer}>
            {isLoadingMechanics ? (
              <View style={styles.recentMechLoading}>
                <Animated.View style={[styles.recentMechSpinner, { transform: [{ rotate: spinnerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })}] }]}>
                  <Text style={styles.recentMechSpinnerText}>⟳</Text>
                </Animated.View>
                <Text style={styles.recentMechLoadingText}>Loading mechanics...</Text>
              </View>
            ) : recentMechanics.length > 0 ? (
              recentMechanics.map((mech, idx) => (
                <View key={mech.id}>
                  <View style={styles.recentMechRow}>
                    <Image source={require('../images/user.png')} style={styles.dropdownIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{mech.name}</Text>
                      <Text style={styles.dropdownMobile}>{mech.garage_name}</Text>
                      <Text style={styles.dropdownAddress}>{mech.mobile}</Text>
                      {mech.request_count > 0 && (
                        <Text style={styles.dropdownHistory}>
                          📋 {mech.request_count} service{mech.request_count > 1 ? 's' : ''} • Last: {mech.last_service}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={styles.callIconBtn}
                      onPress={() => {
                        if (mech.mobile && mech.mobile !== 'N/A') {
                          Linking.openURL(`tel:${mech.mobile}`);
                        } else {
                          Alert.alert('No Phone Number', 'This mechanic does not have a phone number available.');
                        }
                      }}
                    >
                      <Image source={phoneIcon} style={styles.callIcon} />
                    </TouchableOpacity>
                  </View>
                  {idx !== recentMechanics.length - 1 ? <View style={styles.recentMechDivider} /> : null}
                </View>
              ))
            ) : (
              <View style={styles.recentMechEmpty}>
                <Text style={styles.recentMechEmptyText}>No mechanics available at the moment.</Text>
                <TouchableOpacity 
                  style={styles.recentMechRefreshBtn}
                  onPress={fetchRecentMechanics}
                >
                  <Text style={styles.recentMechRefreshBtnText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Quick Services Section */}
        <View style={[styles.section, styles.quickServicesSection]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={serviceIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>QUICK SERVICES</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.quickServicesRow}>
            <TouchableOpacity style={[styles.quickCard, styles.quickCardGreen]} onPress={onFastConnection}>
              <Image source={boltIcon} style={styles.quickServiceBoltIcon} />
              <Text style={styles.quickTitle}>Fast Connection</Text>
              <Text style={styles.quickDesc}>Quick mechanic match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, styles.quickCardBlue]} onPress={onLiveChat}>
              <Image source={messageIcon} style={styles.quickServiceMessageIcon} />
              <Text style={styles.quickTitle}>Live Chat & Call</Text>
              <Text style={styles.quickDesc}>Real-time support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Available Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={settingIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>SERVICES AVAILABLE</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.servicesGrid}>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onBreakdown}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#FFB347' }]}> 
                <Image source={serviceIcons.breakdown} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Breakdown</Text>
              <Text style={styles.serviceDescModern}>Car repair</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onFuelDelivery}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#4ADE80' }]}> 
                <Image source={serviceIcons.fuel} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Fuel Delivery</Text>
              <Text style={styles.serviceDescModern}>Emergency fuel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onTowing}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#60A5FA' }]}> 
                <Image source={serviceIcons.towing} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Towing</Text>
              <Text style={styles.serviceDescModern}>Vehicle towing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onBattery}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#F87171' }]}> 
                <Image source={serviceIcons.battery} style={[styles.serviceIconModern,styles.batteryIcon]} />
              </View>
              <Text style={styles.serviceTitleModern}>Battery</Text>
              <Text style={styles.serviceDescModern}>Jump start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Box for Assigned Worker - Above Tab Bar */}
      {assignedWorker && (
        <Animated.View style={[styles.floatingBox, { transform: [{ translateY: floatingBoxAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0], // Slide up from bottom
        })}] }]}>
          <View style={styles.floatingBoxContent}>
            <View style={styles.floatingBoxLeft}>
              <View style={styles.floatingBoxIconContainer}>
                <Image source={require('../images/engineer.png')} style={styles.floatingBoxIcon} />
                <View style={styles.floatingBoxBadge}>
                  <Text style={styles.floatingBoxBadgeText}>🔧</Text>
                </View>
              </View>
              <View style={styles.floatingBoxTextContainer}>
                <Text style={styles.floatingBoxTitle}>{assignedWorker.worker_name || 'Unknown'}</Text>
                <Text style={styles.floatingBoxSubtitle}>{assignedWorker.garage_name || 'Unknown Garage'}</Text>
                {assignedWorker.user_coords && assignedWorker.garage_coords && (
                  <Text style={styles.floatingBoxDistance}>
                    📍 {assignedWorker.road_distance !== 'N/A' ? `${assignedWorker.road_distance} km away` : 'Distance: N/A'}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.floatingBoxRight}>
              <TouchableOpacity 
                style={styles.floatingBoxViewBtn}
                onPress={() => {
                  console.log('🔍 View button pressed for worker:', assignedWorker);
                  const parentNav = navigation.getParent ? navigation.getParent() : null;
                  const nav = parentNav || navigation;
                  nav.navigate('AssignedMech', {
                    assigned_worker: assignedWorker,
                    user_coords: assignedWorker.user_coords,
                    garage_coords: assignedWorker.garage_coords,
                    request_id: assignedWorker.request_id,
                    user_name: assignedWorker.user_name,
                    user_phone: assignedWorker.user_phone,
                    otp_code: assignedWorker.otp_code,  // Pass the OTP
                  });
                }}
              >
                <Text style={styles.floatingBoxViewBtnText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.floatingBoxCloseBtn}
                onPress={() => setAssignedWorker(null)}
              >
                <Text style={styles.floatingBoxCloseBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
      
      {/* Loading Indicator for Assigned Worker */}
      {isLoadingWorker && !assignedWorker && (
        <Animated.View style={[styles.floatingBoxLoading, { transform: [{ translateY: floatingBoxAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0], // Slide up from bottom
        })}] }]}>
          <View style={styles.floatingBoxContent}>
            <View style={styles.floatingBoxLeft}>
              <View style={styles.floatingBoxIconContainer}>
                <Image source={require('../images/engineer.png')} style={styles.floatingBoxIcon} />
              </View>
              <View style={styles.floatingBoxTextContainer}>
                <Text style={styles.floatingBoxTitle}>Checking assignments...</Text>
                <Text style={styles.floatingBoxSubtitle}>Please wait</Text>
              </View>
            </View>
            <View style={styles.floatingBoxRight}>
              <View style={styles.floatingBoxLoadingSpinner}>
                <Text style={styles.floatingBoxLoadingText}>⟳</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
      
      {/* Error State for Assigned Worker */}
      {workerError && !assignedWorker && !isLoadingWorker && (
        <Animated.View style={[styles.floatingBoxError, { transform: [{ translateY: floatingBoxAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0], // Slide up from bottom
        })}] }]}>
          <View style={styles.floatingBoxContent}>
            <View style={styles.floatingBoxLeft}>
              <View style={styles.floatingBoxIconContainer}>
                <Image source={require('../images/engineer.png')} style={styles.floatingBoxIcon} />
              </View>
              <View style={styles.floatingBoxTextContainer}>
                <Text style={styles.floatingBoxTitle}>Connection Error</Text>
                <Text style={styles.floatingBoxSubtitle}>{workerError}</Text>
              </View>
            </View>
            <View style={styles.floatingBoxRight}>
              <TouchableOpacity 
                style={styles.floatingBoxRetryBtn}
                onPress={fetchActiveRequest}
              >
                <Text style={styles.floatingBoxRetryBtnText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.floatingBoxCloseBtn}
                onPress={() => setWorkerError(null)}
              >
                <Text style={styles.floatingBoxCloseBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
      
      <SOSButtonOverlay visible={sosVisible} onClose={() => setSosVisible(false)} />
    </View>
  );
};

const lightTheme = {
  text: '#22223B',
  textSecondary: '#6B7280',
};

const styles = StyleSheet.create({
  headerGradient: {
    borderRadius: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 0,
    padding: 18,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
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
  greeting: {
    fontSize: 24,
    fontFamily: 'Cormorant-Bold',
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop:-3,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginLeft: 10,
  },
  refreshButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8, // Less rounded corners
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  cardSubText: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  mapPreview: {
    backgroundColor: '#e3e7ee',
    borderRadius: 12,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  vehicleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  vehicleDesc: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  vehicleStatus: {
    fontSize: 13,
    color: '#22C55E',
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
  },
  promoItem: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  promoText: {
    fontSize: 14,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  gpsIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emergencyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  emergencyBtnText: {
    fontSize: 13,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  quickCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    margin: 4,
    minWidth: '45%',
    maxWidth: '48%',
    alignItems: 'flex-start',
    backgroundColor: '#f3f3f3',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  quickDesc: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    margin: 4,
    minWidth: '45%',
    maxWidth: '48%',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  serviceIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  dotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  activityDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  gpsCard: {
    backgroundColor: '#fff',
    borderRadius: 8, // Less rounded corners
    padding: 18,
    marginBottom: 18,
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  gpsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#22223B',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc40',
    marginLeft: 10,
    marginRight: 4,
  },
  statusActive: {
    color: '#2ecc40',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gpsSubTitle: {
    fontSize: 15,
    color: '#22223B',
    marginTop: 6,
    marginBottom: 2,
  },
  gpsDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    marginRight: 8,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  sosCard: {
    backgroundColor: '#FF4D4F',
    marginRight: 8,
  },
  mechanicCard: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  actionIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    tintColor: '#fff',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center', // Center text
  },
  actionDesc: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center', // Center text
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 8,
    // 3D shadow
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, // Android
  },
  actionBtnText: {
    color: '#FF4D4F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionBtnOutline: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 8,
    // 3D shadow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, // Android
  },
  actionBtnOutlineText: {
    color: '#3B82F6', // Blue text
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 18, // Reduced from 24
  },
  sectionHeader: {
    fontSize: 22,
    color: '#22223B',
    marginBottom: 10,
    fontFamily: 'Cormorant-Bold',
  },
  quickServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quickCardGreen: {
    backgroundColor: '#eaffea',
    borderColor: '#2ecc40',
    borderWidth: 1,
  },
  quickCardBlue: {
    backgroundColor: '#f0f7ff',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  serviceCardModern: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    width: '47%',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#f3e7e9',
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f7fafc',
    shadowColor: '#a1c4fd',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceIconModern: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  batteryIcon:{
    width:31,
    height:31,
  },
  serviceTitleModern: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  serviceDescModern: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 1,
    fontFamily: 'Poppins-Regular',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitleModern: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22223B',
  },
  activityDescModern: {
    fontSize: 15,
    color: '#6B7280',
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15, // Increased for stronger shadow
    shadowRadius: 16,    // Increased for softer shadow
    shadowOffset: { width: 0, height: 4 }, // More natural shadow
    elevation: 8,        // Increased for Android
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
    fontFamily: 'Poppins-Regular',
    color: '#22223B',
  },
  resultsContainer: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  mechanicBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mechanicAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  mechanicName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  mechanicMobile: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 18,
    color: '#22223B',
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  searchOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 20,
    // top will be set dynamically
  },
  dropdownContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    // top is set dynamically
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 1000, // much higher for Android
    zIndex: 9999, // much higher for iOS/web
    paddingVertical: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
    resizeMode: 'contain',
    tintColor: '#B0B0B0', // Grey tint
  },
  dropdownName: {
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  dropdownMobile: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 54,
    marginRight: 0,
  },
  dropdownRowHighlight: {
    backgroundColor: '#f0f4ff', // or any highlight color you prefer
  },
  callIconBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    width: 24,
    height: 24,
    tintColor: '#E53935',
    resizeMode: 'contain',
  },
  noResultText: {
    color: '#E53935',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  recentMechContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: '100%',
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  recentMechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  recentMechDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 54,
    marginRight: 0,
  },
  mapContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    height: 160, // Make sure this is not too small!
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    overflow: 'hidden', // Ensures rounded corners for the map
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholderText: {
    color: '#6c757d',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  emergencyContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    marginTop: 0,
    marginBottom: 0,
  },
  gpsCarSvgContainer: {
    width: 48,
    height: 28,
    marginLeft: 8,
    marginRight: 2,
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
  quickServicesSection: {
    marginBottom: 4,
  },
  gpsSection: {
    marginBottom: 4,
  },
  sectionIcon: {
    width: 25,
    height: 25,
    marginRight: 8,
    marginBottom:8,
    resizeMode: 'contain',
  },
  emergencyStyle:{
    height : 21,
    width : 21,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
    marginTop:-13,
    marginHorizontal: 2,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOpacity:0.10,
    shadowRadius:3,
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
  quickServiceBoltIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#22C55E', // green
    alignSelf: 'flex-start',
  },
  quickServiceChatIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#3B82F6', // blue
    alignSelf: 'flex-start',
  },
  quickServiceMessageIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#3B82F6', // blue
    alignSelf: 'flex-start',
  },
  floatingBox: {
    position: 'absolute',
    bottom: 80, // Adjust based on tab bar height
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Add subtle gradient effect
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
    // Ensure content doesn't overflow
    minHeight: 80,
  },
  floatingBoxContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  floatingBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  floatingBoxIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingBoxIcon: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    tintColor: '#0EA5E9',
  },
  floatingBoxBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBoxBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingBoxTextContainer: {
    flex: 1,
    marginRight: 12,
    maxWidth: '60%',
  },
  floatingBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  floatingBoxSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  floatingBoxDistance: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'Poppins-Medium',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  floatingBoxRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 8,
  },
  floatingBoxViewBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 8,
    minWidth: 50,
  },
  floatingBoxViewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  floatingBoxCloseBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 36,
  },
  floatingBoxCloseBtnText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  floatingBoxLoading: {
    position: 'absolute',
    bottom: 80, // Adjust based on tab bar height
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  floatingBoxLoadingSpinner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#2563EB',
    borderTopColor: 'transparent',
    alignSelf: 'center',
  },
  floatingBoxLoadingText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
    marginTop: 5,
  },
  floatingBoxStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  floatingBoxStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc40',
    marginRight: 6,
  },
  floatingBoxError: {
    position: 'absolute',
    bottom: 80, // Adjust based on tab bar height
    left: 20,
    right: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  floatingBoxRetryBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  floatingBoxRetryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  recentMechLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  recentMechLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  recentMechEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  recentMechEmptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  recentMechRefreshBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  recentMechRefreshBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  dropdownAddress: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  sectionRefreshBtn: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionRefreshBtnText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  recentMechSpinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderTopColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentMechSpinnerText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownHistory: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
});

export default UserHome; 