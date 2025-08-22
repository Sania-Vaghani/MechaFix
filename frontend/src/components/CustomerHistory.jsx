import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import backArrowIcon from '../images/arrow.png';
import phoneIcon from '../images/phone.png';
import messageIcon from '../images/message.png';

export default function CustomerHistory() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      await fetchCurrentUser();
      await fetchCustomerHistory();
    } catch (error) {
      console.log('❌ [CustomerHistory] Error in fetchData:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return;

      const response = await API.get('users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setCurrentUser(response.data);
        console.log('✅ [CustomerHistory] Current user fetched:', response.data.username);
      }
    } catch (error) {
      console.log('❌ [CustomerHistory] Error fetching current user:', error);
    }
  };

  const fetchCustomerHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) return;

      if (!currentUser?._id) {
        console.log('⚠️ [CustomerHistory] No current user ID available');
        return;
      }

      console.log('🔍 [CustomerHistory] Fetching customer history from service_requests...');

      // Primary: Try to fetch from service_requests collection
      try {
        const requestsResponse = await API.get('service-requests/recent/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (requestsResponse.data && requestsResponse.data.requests) {
          const allRequests = requestsResponse.data.requests;
          console.log('🔍 [CustomerHistory] Found service requests:', allRequests.length, 'items');
          
          // Filter requests where this mechanic is involved (either in mechanics_list or assigned_worker)
          const mechanicRequests = allRequests.filter(request => {
            // Check if mechanic is in mechanics_list
            const inMechanicsList = request.mechanics_list && 
              request.mechanics_list.some(mech => mech.mech_id === currentUser._id);
            
            // Check if mechanic is assigned worker
            const isAssignedWorker = request.assigned_worker && 
              request.assigned_worker.worker_id === currentUser._id;
            
            return inMechanicsList || isAssignedWorker;
          });

          console.log('🔍 [CustomerHistory] Mechanic-specific requests:', mechanicRequests.length, 'items');
          
          if (mechanicRequests.length > 0) {
            // Transform service_requests data to customer history format
            const transformedHistory = mechanicRequests.map(request => {
              // Find the mechanic's specific data from mechanics_list
              const mechanicData = request.mechanics_list?.find(mech => mech.mech_id === currentUser._id);
              
              return {
                _id: request._id,
                user_name: request.user_name || 'Unknown Customer',
                user_phone: request.user_phone || 'N/A',
                car_model: request.car_model || 'Unknown Car',
                license_plate: request.license_plate || 'No Plate',
                breakdown_type: request.breakdown_type || request.issue_type || 'Unknown Issue',
                status: mechanicData?.status || 'pending',
                distance: mechanicData?.distance_km ? `${mechanicData.distance_km.toFixed(1)} km` : 'N/A',
                recorded_at: request.created_at || new Date().toISOString(),
                completed_at: request.completed_at,
                rating: mechanicData?.rating || null,
                comment: mechanicData?.comment || null,
                request_data: request // Keep full request data for reference
              };
            });

            console.log('✅ [CustomerHistory] Transformed history from service_requests:', transformedHistory.length, 'items');
            setCustomerHistory(transformedHistory);
            
            // Calculate stats from service_requests data
            const total = transformedHistory.length;
            const completed = transformedHistory.filter(req => req.status === 'completed').length;
            const pending = transformedHistory.filter(req => req.status === 'pending' || req.status === 'accepted').length;
            
            setStats({ total, completed, pending });
            console.log('📊 [CustomerHistory] Stats calculated from service_requests:', { total, completed, pending });
            return;
          }
        }
      } catch (requestsError) {
        console.log('⚠️ [CustomerHistory] Service requests endpoint failed:', requestsError);
      }

      // Fallback: Try to get data from user_history as before
      console.log('🔄 [CustomerHistory] Trying user_history fallback...');
      try {
        const profileResponse = await API.get(`users/mech/${currentUser._id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.data && profileResponse.data.user_history) {
          const userHistory = profileResponse.data.user_history;
          console.log('✅ [CustomerHistory] Fallback: Found user_history in profile:', userHistory.length, 'items');
          
          // Transform user_history data to match component structure
          const transformedHistory = userHistory.map(history => ({
            _id: history.request_id || history._id || `history_${Math.random()}`,
            user_name: history.user_name || history.userName || 'Unknown Customer',
            user_phone: history.user_phone || history.phone || 'N/A',
            car_model: history.car_model || history.carModel || 'Unknown Car',
            license_plate: history.license_plate || history.licensePlate || 'No Plate',
            breakdown_type: history.breakdown_type || history.issueType || 'Unknown Issue',
            status: history.status || 'completed',
            distance: history.distance || history.distance_km || 'N/A',
            recorded_at: history.recorded_at || history.recordedAt || history.created_at || new Date().toISOString(),
            completed_at: history.completed_at || history.completedAt,
            rating: history.rating || null,
            comment: history.comment || null
          }));

          setCustomerHistory(transformedHistory);
          
          // Calculate stats from user_history data
          const total = transformedHistory.length;
          const completed = transformedHistory.filter(req => req.status === 'completed').length;
          const pending = transformedHistory.filter(req => req.status === 'pending' || req.status === 'accepted').length;
          
          setStats({ total, completed, pending });
          console.log('📊 [CustomerHistory] Stats calculated from user_history fallback:', { total, completed, pending });
          return;
        }
      } catch (profileError) {
        console.log('❌ [CustomerHistory] Profile endpoint fallback also failed:', profileError);
      }

      // Final fallback: Try test endpoint
      console.log('🔄 [CustomerHistory] Trying test endpoint as final fallback...');
      try {
        const testResponse = await API.get('users/test-user-history/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (testResponse.data.status === 'success') {
          const mechanics = testResponse.data.mechanics;
          const currentMech = mechanics.find(m => m._id === currentUser._id);
          
          if (currentMech && currentMech.user_history) {
            const userHistory = currentMech.user_history;
            console.log('✅ [CustomerHistory] Final fallback: Found user_history via test endpoint:', userHistory.length, 'items');
            
            // Transform user_history data to match component structure
            const transformedHistory = userHistory.map(history => ({
              _id: history.request_id || history._id || `history_${Math.random()}`,
              user_name: history.user_name || history.userName || 'Unknown Customer',
              user_phone: history.user_phone || history.phone || 'N/A',
              car_model: history.car_model || history.carModel || 'Unknown Car',
              license_plate: history.license_plate || history.licensePlate || 'No Plate',
              breakdown_type: history.breakdown_type || history.issueType || 'Unknown Issue',
              status: history.status || 'completed',
              distance: history.distance || history.distance_km || 'N/A',
              recorded_at: history.recorded_at || history.recordedAt || history.created_at || new Date().toISOString(),
              completed_at: history.completed_at || history.completedAt,
              rating: history.rating || null,
              comment: history.comment || null
            }));

            setCustomerHistory(transformedHistory);
            
            // Calculate stats from test endpoint data
            const total = transformedHistory.length;
            const completed = transformedHistory.filter(req => req.status === 'completed').length;
            const pending = transformedHistory.filter(req => req.status === 'pending' || req.status === 'accepted').length;
            
            setStats({ total, completed, pending });
            console.log('📊 [CustomerHistory] Stats calculated from test endpoint fallback:', { total, completed, pending });
            return;
          }
        }
      } catch (testError) {
        console.log('❌ [CustomerHistory] Test endpoint fallback also failed:', testError);
      }

      // If all attempts fail, set empty state
      console.log('⚠️ [CustomerHistory] All data sources failed, setting empty state');
      setCustomerHistory([]);
      setStats({ total: 0, completed: 0, pending: 0 });
      
    } catch (error) {
      console.log('❌ [CustomerHistory] Error fetching customer history:', error);
      setError('Failed to load customer history. Please try again.');
      setCustomerHistory([]);
      setStats({ total: 0, completed: 0, pending: 0 });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomerHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D4F" />
        <Text style={styles.loadingText}>Loading customer history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - Styled like SOS header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Image source={backArrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Customer History</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Service Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statCircle, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
              </View>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statCircle, { backgroundColor: '#10B981' }]}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
              </View>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statCircle, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
              </View>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Customer History List - Individual Cards */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Services</Text>
          
          {customerHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No customer history found</Text>
              <Text style={styles.emptySubtext}>Completed services will appear here</Text>
            </View>
          ) : (
            customerHistory.map((customer, index) => (
              <View key={customer._id || index} style={styles.customerCard}>
                {/* Customer Header */}
                <View style={styles.customerHeader}>
                  <View style={styles.customerAvatar}>
                    <Text style={styles.avatarText}>
                      {customer.user_name?.split(' ').map(n => n[0]).join('') || 'CU'}
                    </Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customer.user_name || 'Unknown Customer'}</Text>
                    <Text style={styles.customerCar}>
                      {customer.car_model || 'Unknown Car'} • {customer.license_plate || 'No Plate'}
                    </Text>
                    <Text style={styles.customerIssue}>
                      {customer.breakdown_type || 'Unknown Issue'}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(customer.status)}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Customer Details */}
                <View style={styles.customerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>{customer.distance}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(customer.completed_at)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  // Header styled like SOS header
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    paddingTop: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 26,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  historySection: {
    marginBottom: 18,
  },
  historyTitle: {
    fontSize: 26,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    marginBottom: 18,
  },
  // Individual customer cards
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C189FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  customerCar: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  customerIssue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  customerDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins-Medium',
  },
  retryButton: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
}); 