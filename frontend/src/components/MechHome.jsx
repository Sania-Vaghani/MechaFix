import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import user2Icon from '../images/user2.png';
import settingIcon from '../images/setting.png';
import bellIcon from '../images/customer-service.png';
import chatIcon from '../images/chat.png';
import historyIcon from '../images/history.png';
import addIcon from '../images/add.png';
import customerIcon from '../images/customer.png';
import hiIcon from '../images/hi.png';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
// import customerIcon from '../images/customer.png';


export default function MechHome() {
  const [available, setAvailable] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      const userType = await AsyncStorage.getItem('userType');
      if (token && userType === 'mechanic') {
        try {
          const res = await API.get('users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.log('Failed to fetch mechanic profile', err);
        }
      }
    };
    
    const fetchData = async () => {
      await Promise.all([
        fetchProfile(),
        fetchOverviewData(),
        fetchRecentRequests()
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  // Add token validation function
  const validateToken = (token) => {
    try {
      // Simple JWT token validation - check if it's a valid format
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      // Check if token has 3 parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Try to decode the payload to check expiration
      try {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('❌ [MechHome] JWT token is expired');
          return false;
        }
        
        console.log('✅ [MechHome] JWT token is valid, expires at:', new Date(payload.exp * 1000));
        return true;
      } catch (decodeError) {
        console.log('❌ [MechHome] Failed to decode JWT payload:', decodeError);
        return false;
      }
    } catch (error) {
      console.log('❌ [MechHome] Token validation error:', error);
      return false;
    }
  };

  const fetchOverviewData = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('❌ [MechHome] No JWT token found in AsyncStorage');
        return;
      }

      // Validate token before making API calls
      if (!validateToken(token)) {
        console.log('❌ [MechHome] JWT token is invalid or expired');
        return;
      }

      console.log('🔑 [MechHome] JWT Token found:', token.substring(0, 20) + '...');
      console.log('📊 [MechHome] Fetching overview data from service_requests...');

      // Get current mechanic's profile to access their ID
      const mechResponse = await API.get('users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (mechResponse.data && mechResponse.data._id) {
        const mechanicId = mechResponse.data._id;
        console.log('📊 [MechHome] Mechanic ID:', mechanicId);
        
        // Primary: Try to get today's overview from dedicated endpoint
        try {
          console.log('🔍 [MechHome] Calling service-requests/today-overview/ with token:', token.substring(0, 20) + '...');
          const overviewResponse = await API.get('service-requests/today-overview/', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (overviewResponse.data && overviewResponse.data.status === 'success') {
            const overview = overviewResponse.data.overview;
            console.log('📊 [MechHome] Today\'s overview from endpoint:', overview);
            setOverviewData(overview);
            return;
          }
        } catch (overviewError) {
          console.log('📊 [MechHome] Today\'s overview endpoint failed:', overviewError.response?.status, overviewError.response?.data);
        }

        // Fallback: Fetch service requests and calculate stats
        try {
          const requestsResponse = await API.get('service-requests/recent/', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (requestsResponse.data && requestsResponse.data.requests) {
            const allRequests = requestsResponse.data.requests;
            console.log('📊 [MechHome] Found service requests:', allRequests.length, 'items');
            
            // Filter requests where this mechanic is involved (either in mechanics_list or assigned_worker)
            const mechanicRequests = allRequests.filter(request => {
              // Check if mechanic is in mechanics_list
              const inMechanicsList = request.mechanics_list && 
                request.mechanics_list.some(mech => mech.mech_id === mechanicId);
              
              // Check if mechanic is assigned worker
              const isAssignedWorker = request.assigned_worker && 
                request.assigned_worker.worker_id === mechanicId;
              
              return inMechanicsList || isAssignedWorker;
            });

            console.log('📊 [MechHome] Mechanic-specific requests:', mechanicRequests.length, 'items');
            
            // Calculate stats
            const total = mechanicRequests.length;
            const completed = mechanicRequests.filter(req => {
              // Check if any mechanic in mechanics_list has completed status
              const hasCompleted = req.mechanics_list && 
                req.mechanics_list.some(mech => mech.mech_id === mechanicId && mech.status === 'completed');
              return hasCompleted;
            }).length;
            
            const pending = mechanicRequests.filter(req => {
              // Check if any mechanic in mechanics_list has pending/accepted status
              const hasPending = req.mechanics_list && 
                req.mechanics_list.some(mech => 
                  mech.mech_id === mechanicId && 
                  (mech.status === 'pending' || mech.status === 'accepted')
                );
              return hasPending;
            }).length;
            
            console.log('📊 [MechHome] Overview stats from service_requests:', { total, completed, pending });
            setOverviewData({ total, completed, pending });
            return;
          }
        } catch (requestsError) {
          console.log('📊 [MechHome] Service requests endpoint failed:', requestsError);
        }

        // Final fallback: Try to get data from user_history as before
        try {
          const profileResponse = await API.get(`users/mech/${mechanicId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (profileResponse.data && profileResponse.data.user_history) {
            const userHistory = profileResponse.data.user_history;
            console.log('📊 [MechHome] Final fallback: Found user_history in profile:', userHistory.length, 'items');
            
            const total = userHistory.length;
            const completed = userHistory.filter(req => req.status === 'completed').length;
            const pending = userHistory.filter(req => req.status === 'pending').length;
            
            console.log('📊 [MechHome] Overview stats via final fallback:', { total, completed, pending });
            setOverviewData({ total, completed, pending });
            return;
          }
        } catch (profileError) {
          console.log('📊 [MechHome] Profile endpoint fallback also failed:', profileError);
        }
      }

      console.log('📊 [MechHome] Using fallback mock data');
      // Final fallback to mock data
      setOverviewData({
        total: 5,
        pending: 2,
        completed: 3
      });
    } catch (error) {
      console.log('📊 [MechHome] Error fetching overview data:', error);
      // Fallback to mock data
      setOverviewData({
        total: 5,
        pending: 2,
        completed: 3
      });
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.log('❌ [MechHome] No JWT token found in AsyncStorage for recent requests');
        return;
      }

      // Validate token before making API calls
      if (!validateToken(token)) {
        console.log('❌ [MechHome] JWT token is invalid or expired for recent requests');
        return;
      }

      console.log('🔑 [MechHome] JWT Token for recent requests:', token.substring(0, 20) + '...');
      console.log('📋 [MechHome] Fetching recent requests from service_requests...');

      // Get current mechanic's profile to access their ID
      const mechResponse = await API.get('users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (mechResponse.data && mechResponse.data._id) {
        const mechanicId = mechResponse.data._id;
        console.log('📋 [MechHome] Mechanic ID:', mechanicId);
        
        // Fetch service requests where this mechanic is involved
        try {
          console.log('🔍 [MechHome] Calling service-requests/recent/ with token:', token.substring(0, 20) + '...');
          const requestsResponse = await API.get('service-requests/recent/', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (requestsResponse.data && requestsResponse.data.requests) {
            const allRequests = requestsResponse.data.requests;
            console.log('📋 [MechHome] Found service requests:', allRequests.length, 'items');
            
            // Filter requests where this mechanic is involved (either in mechanics_list or assigned_worker)
            const mechanicRequests = allRequests.filter(request => {
              // Check if mechanic is in mechanics_list
              const inMechanicsList = request.mechanics_list && 
                request.mechanics_list.some(mech => mech.mech_id === mechanicId);
              
              // Check if mechanic is assigned worker
              const isAssignedWorker = request.assigned_worker && 
                request.assigned_worker.worker_id === mechanicId;
              
              return inMechanicsList || isAssignedWorker;
            });

            console.log('📋 [MechHome] Mechanic-specific requests:', mechanicRequests.length, 'items');
            
            // Transform service_requests data to recent requests format and limit to 3
            const transformedRequests = mechanicRequests.slice(0, 3).map((request, index) => {
              // Find the mechanic's specific data from mechanics_list
              const mechanicData = request.mechanics_list?.find(mech => mech.mech_id === mechanicId);
              
              return {
                _id: request._id || `request_${index}`,
                user_name: request.user_name || 'Unknown Customer',
                breakdown_type: request.breakdown_type || request.issue_type || 'Unknown Issue',
                distance: mechanicData?.distance_km ? `${mechanicData.distance_km.toFixed(1)} km` : 'N/A',
                status: mechanicData?.status || 'pending',
                user_phone: request.user_phone || 'N/A',
                car_model: request.car_model || 'Unknown Car',
                license_plate: request.license_plate || 'No Plate',
                recorded_at: request.created_at || new Date().toISOString(),
                request_data: request // Keep full request data for reference
              };
            });

            console.log('📋 [MechHome] Transformed recent requests from service_requests:', transformedRequests);
            setRecentRequests(transformedRequests);
            return;
          }
        } catch (requestsError) {
          console.log('📋 [MechHome] Service requests endpoint failed:', requestsError.response?.status, requestsError.response?.data);
        }

        // Fallback: Try to get data from user_history as before
        try {
          const profileResponse = await API.get(`users/mech/${mechanicId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (profileResponse.data && profileResponse.data.user_history) {
            const userHistory = profileResponse.data.user_history;
            console.log('📋 [MechHome] Fallback: Found user_history in profile:', userHistory.length, 'items');
            
            // Transform user_history to recent requests format and limit to 3
            const transformedRequests = userHistory.slice(0, 3).map((history, index) => ({
              _id: history.request_id || `history_${index}`,
              user_name: history.user_name || 'Unknown Customer',
              breakdown_type: history.breakdown_type || 'Unknown Issue',
              distance: history.distance || history.distance_km || 'N/A',
              status: history.status || 'completed',
              user_phone: history.user_phone || 'N/A',
              car_model: history.car_model || 'Unknown Car',
              license_plate: history.license_plate || 'No Plate',
              recorded_at: history.recorded_at || new Date().toISOString()
            }));

            console.log('📋 [MechHome] Transformed recent requests via fallback:', transformedRequests);
            setRecentRequests(transformedRequests);
            return;
          }
        } catch (profileError) {
          console.log('📋 [MechHome] Profile endpoint fallback also failed:', profileError);
        }
      }

      console.log('📋 [MechHome] Using fallback mock data');
      // Final fallback to mock data
      setRecentRequests([
        { 
          _id: '1', 
          user_name: 'John Doe', 
          breakdown_type: 'Battery Issue', 
          distance: '2.3 km',
          status: 'pending'
        },
        { 
          _id: '2', 
          user_name: 'Alice Smith', 
          breakdown_type: 'Engine Problem', 
          distance: '1.8 km',
          status: 'assigned'
        }
      ]);
    } catch (error) {
      console.log('📋 [MechHome] Error fetching recent requests:', error);
      // Fallback to mock data
      setRecentRequests([
        { 
          _id: '1', 
          user_name: 'John Doe', 
          breakdown_type: 'Battery Issue', 
          distance: '2.3 km',
          status: 'pending'
        },
        { 
          _id: '2', 
          user_name: 'Alice Smith', 
          breakdown_type: 'Engine Problem', 
          distance: '1.8 km',
          status: 'assigned'
        }
      ]);
    }
  };

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

  const handleAddMechanic = () => {
    navigation.navigate('Services');
  };

  const handleViewHistory = () => {
    navigation.navigate('CustomerHistory');
  };

  const handleViewRequest = (request) => {
    // Navigate to request details or worker page
    navigation.navigate('WorkerPage', { requestId: request._id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'assigned':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'assigned':
        return 'Assigned';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
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
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>
              {user ? `Hello, ${user.username}` : 'Hello!'}
              </Text>
              <Image source={hiIcon} style={{ width: 38, height: 38, marginLeft: 6, marginTop: 2 }} />
            </View>
            <Text style={styles.headerSubtitle}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('WorkerPage')}>
            <Image source={user2Icon} style={styles.headerImgIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, paddingTop: 120 }} showsVerticalScrollIndicator={false}>
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
          <View style={[styles.infoCard, { backgroundColor: '#2563EB' }]}> 
            <View style={styles.infoIconContainer}>
              <Image source={addIcon} style={styles.infoIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: '#fff' }]}>Add Mechanic</Text>
            <Text style={[styles.infoDesc, { color: '#fff' }]}>Add team members</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: '#fff' }]} onPress={handleAddMechanic}>
              <Text style={[styles.infoBtnText, { color: '#2563EB' }]}>Add Now</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#22C55E' }]}> 
            <View style={styles.infoIconContainer}>
              <Image source={customerIcon} style={styles.infoIcon} />
            </View>
            <Text style={[styles.infoTitle, { color: '#fff' }]}>Customer History</Text>
            <Text style={[styles.infoDesc, { color: '#fff' }]}>View past services</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: '#fff' }]} onPress={handleViewHistory}> 
              <Text style={[styles.infoBtnText, { color: '#22C55E' }]}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Today's Overview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#FF4D4F' }]}>
                <Text style={styles.overviewNum}>{overviewData.total}</Text>
              </View>
              <Text style={styles.overviewLabel}>Requests</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.overviewNum}>{overviewData.pending}</Text>
              </View>
              <Text style={styles.overviewLabel}>Pending</Text>
            </View>
            <View style={styles.overviewItem}>
              <View style={[styles.overviewCircle, { backgroundColor: '#22C55E' }]}>
                <Text style={styles.overviewNum}>{overviewData.completed}</Text>
              </View>
              <Text style={styles.overviewLabel}>Completed</Text>
            </View>
          </View>
        </View>
        {/* Recent Requests */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          {recentRequests.length === 0 ? (
            <View style={styles.emptyRequests}>
              <Text style={styles.emptyRequestsText}>No recent requests found</Text>
              <Text style={styles.emptyRequestsSubtext}>Service requests will appear here</Text>
            </View>
          ) : (
            recentRequests.map(req => (
              <View key={req._id} style={styles.requestRow}>
                <View style={styles.requestAvatar}>
                  <Text style={styles.requestAvatarText}>
                    {req.user_name?.split(' ').map(n => n[0]).join('') || 'CU'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.requestName}>{req.user_name}</Text>
                  <Text style={styles.requestIssue}>{req.breakdown_type} • {req.distance} away</Text>
                  {req.car_model && req.car_model !== 'Unknown Car' && (
                    <Text style={styles.requestCar}>{req.car_model} {req.license_plate !== 'No Plate' ? `• ${req.license_plate}` : ''}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.requestBtn, { backgroundColor: getStatusColor(req.status) }]} 
                  onPress={() => handleViewRequest(req)}
                >
                  <Text style={styles.requestBtnText}>{getStatusText(req.status)}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

      </ScrollView>
      
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
    marginBottom:30,
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
    fontSize: 24,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
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
  infoIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    tintColor: '#fff',
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
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  overviewLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  overviewCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    borderRadius: 29,
    backgroundColor: '#C189FF',
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
  requestCar: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyRequestsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  emptyRequestsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
});
