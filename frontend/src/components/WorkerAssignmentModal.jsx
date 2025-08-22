import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkerAssignmentModal = ({ visible, onClose, requestId, onWorkerAssigned }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchWorkers();
    }
  }, [visible]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      
      console.log('🔍 Fetching workers from API...');
      
      // Fetch available workers for this mechanic
      const response = await axios.get('http://10.0.2.2:8000/api/mechanic/workers/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📡 Workers API response:', response.data);

      // The API returns {workers: [...]} not {status: 'success', workers: [...]}
      if (response.data.workers && Array.isArray(response.data.workers)) {
        // Transform the workers data to include status and rating
        const transformedWorkers = response.data.workers.map(worker => ({
          id: worker.id || worker._id,
          name: worker.name,
          phone: worker.phone,
          status: 'available', // Default status since API doesn't provide it
          rating: 4.5, // Default rating since API doesn't provide it
          created_at: worker.created_at
        }));
        
        console.log('✅ Workers loaded:', transformedWorkers);
        setWorkers(transformedWorkers);
      } else {
        console.log('⚠️ No workers found in response');
        setWorkers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching workers:', error.response?.data || error.message);
      
      // For demo purposes, create mock workers if API fails
      setWorkers([
        { id: '1', name: 'Rahul Kumar', phone: '9876543210', status: 'available', rating: 4.5 },
        { id: '2', name: 'Amit Patel', phone: '9876543211', status: 'available', rating: 4.2 },
        { id: '3', name: 'Suresh Singh', phone: '9876543212', status: 'busy', rating: 4.8 },
        { id: '4', name: 'Vikram Mehta', phone: '9876543213', status: 'available', rating: 4.0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isValidObjectId = (value) => {
    return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
  };

  const handleAssign = async (worker) => {
    try {
      setAssigning(true); // ✅ instead of setLoading
      const workerId = String(worker.id || worker._id);
      if (!requestId || !workerId || !isValidObjectId(workerId)) {
        Alert.alert('Error', 'Invalid request or worker id');
        return;
      }
      const res = await axios.post("http://10.0.2.2:8000/api/assign-worker/", {
        request_id: String(requestId),
        worker_id: workerId,
      });
      
  
      if (res.data.status === "success") {
        onWorkerAssigned(worker); // ✅ notify parent
        onClose();
      } else {
        Alert.alert("Error", res.data.error || "Failed to assign worker");
      }
    } catch (err) {
      console.error("❌ Error assigning worker:", err?.response?.data || err.message);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Could not assign worker';
      Alert.alert("Error", msg);
    } finally {
      setAssigning(false); // ✅ reset properly
    }
  };
  
  

  const getStatusColor = (status) => {
    return status === 'available' ? '#10B981' : '#EF4444';
  };

  const getStatusText = (status) => {
    return status === 'available' ? 'Available' : 'Busy';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.75)" barStyle="light-content" translucent />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Bottom Handle Indicator */}
          <View style={styles.bottomHandle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Assign Worker</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4D4F" />
                <Text style={styles.loadingText}>Loading workers...</Text>
              </View>
            ) : workers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No workers available</Text>
                <Text style={styles.emptySubtext}>Add workers to your team to assign them to requests</Text>
              </View>
            ) : (
              workers.map((worker, index) => (
                <View key={`${worker.id || worker._id || worker.phone || 'w'}-${index}`} style={styles.workerCard}>
                  <View style={styles.workerInfo}>
                    <View style={styles.workerHeader}>
                      <Text style={styles.workerName}>{worker.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(worker.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(worker.status)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.workerDetails}>
                      <Text style={styles.workerPhone}>📞 {worker.phone}</Text>
                      <Text style={styles.workerRating}>⭐ {worker.rating || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
  style={[
    styles.assignButton,
    (worker.status === 'busy' || !isValidObjectId(worker.id || worker._id)) && styles.assignButtonDisabled
  ]}
  onPress={() => handleAssign(worker)}   // ✅ fixed function name
  disabled={worker.status === 'busy' || assigning || !isValidObjectId(worker.id || worker._id)}
>
  {assigning ? (
    <ActivityIndicator size="small" color="#FFFFFF" />
  ) : (
    <Text style={styles.assignButtonText}>
      {worker.status === 'busy' ? 'Busy' : !isValidObjectId(worker.id || worker._id) ? 'Invalid ID' : 'Assign'}
    </Text>
  )}
</TouchableOpacity>

                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0, // Cover the entire screen including camera area
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '95%',
    maxHeight: '85%',
    shadowColor: '#FF4D4F',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.08)',
    marginTop: 130, // Reduced from 100 to better position content
  },
  bottomHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  workerInfo: {
    flex: 1,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  workerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  workerRating: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  assignButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  assignButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default WorkerAssignmentModal; 