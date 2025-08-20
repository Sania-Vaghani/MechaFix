import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
          id: worker._id,
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

  const handleAssign = async (worker) => {
    try {
      setAssigning(true); // ✅ instead of setLoading
      const res = await axios.post("http://10.0.2.2:8000/api/assign-worker/", {
        request_id: requestId,
        worker_id: worker.id,
      });
      
  
      if (res.data.status === "success") {
        onWorkerAssigned(worker); // ✅ notify parent
        onClose();
      } else {
        Alert.alert("Error", res.data.error || "Failed to assign worker");
      }
    } catch (err) {
      console.error("❌ Error assigning worker:", err);
      Alert.alert("Error", "Could not assign worker");
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
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
              workers.map((worker) => (
                <View key={worker.id} style={styles.workerCard}>
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
    worker.status === 'busy' && styles.assignButtonDisabled
  ]}
  onPress={() => handleAssign(worker)}   // ✅ fixed function name
  disabled={worker.status === 'busy' || assigning}
>
  {assigning ? (
    <ActivityIndicator size="small" color="#FFFFFF" />
  ) : (
    <Text style={styles.assignButtonText}>
      {worker.status === 'busy' ? 'Busy' : 'Assign'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  workerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  assignButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default WorkerAssignmentModal; 