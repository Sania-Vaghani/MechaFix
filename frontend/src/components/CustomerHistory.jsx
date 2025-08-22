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

  const handleCall = (phone) => {
    // Handle phone call
    console.log('Calling:', phone);
  };

  const handleMessage = (phone) => {
    // Handle message
    console.log('Messaging:', phone);
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
      {/* Header */}
      <LinearGradient
        colors={['#FF4D4F', '#FF7875']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer History</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

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
              <View style={[styles.statCircle, { backgroundColor: '#FF4D4F' }]}>
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

        {/* Customer History List */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Services</Text>
          
          {customerHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No customer history found</Text>
              <Text style={styles.emptySubtext}>Completed services will appear here</Text>
            </View>
          ) : (
            customerHistory.map((customer, index) => (
              <View key={customer._id || index} style={styles.customerItem}>
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
                  <View style={styles.customerActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCall(customer.user_phone)}
                    >
                      <Image source={phoneIcon} style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleMessage(customer.user_phone)}
                    >
                      <Image source={messageIcon} style={styles.actionIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.customerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(customer.status)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completed:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(customer.completed_at)}
                    </Text>
                  </View>
                  
                  {customer.mechanic_name && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mechanic:</Text>
                      <Text style={styles.detailValue}>{customer.mechanic_name}</Text>
                    </View>
                  )}
                  
                  {customer.total_amount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount:</Text>
                      <Text style={styles.detailValue}>₹{customer.total_amount}</Text>
                    </View>
                  )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
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
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
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
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  customerItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerCar: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerIssue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: '#6B7280',
  },
  customerDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
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
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
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
  },
  errorCard: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
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
  },
}); 