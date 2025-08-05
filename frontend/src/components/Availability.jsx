import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Image, Modal, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import deleteIcon from '../images/delete.png';
import customerIcon from '../images/customer_s.png';
import serviceIcon from '../images/service.png';
import backArrowIcon from '../images/arrow.png';

export default function Availability() {
  const navigation = useNavigation();
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('06:00 PM');
  const [serviceRadius, setServiceRadius] = useState(10);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState('start'); // 'start' or 'end'
  const [tempHour, setTempHour] = useState(9);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState('AM');
  
  // Sample current services data
  const [currentServices, setCurrentServices] = useState([
    { id: 1, name: 'Battery Replacement', description: 'Car battery replacement service', price: '₹500' },
    { id: 2, name: 'Engine Repair', description: 'Complete engine diagnostic and repair', price: '₹1500' },
    { id: 3, name: 'Tire Change', description: 'Flat tire replacement service', price: '₹300' },
  ]);

  // Optimized slider handler with proper drag support
  const handleSliderPress = useCallback((event) => {
    const { locationX } = event.nativeEvent;
    // Get the actual track width from the event target
    const trackWidth = 280; // Fixed width for consistency
    
    // Calculate percentage based on touch position relative to track
    const percentage = Math.max(0, Math.min(100, (locationX / trackWidth) * 100));
    
    // Convert percentage to value (1-50)
    const newValue = Math.round(1 + (percentage / 100) * 49);
    
    // Ensure value is within bounds
    const clampedValue = Math.max(1, Math.min(50, newValue));
    
    if (clampedValue !== serviceRadius) {
      setServiceRadius(clampedValue);
    }
  }, [serviceRadius]);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Optimized preset button handler
  const handlePresetChange = useCallback((value) => {
    if (value !== serviceRadius) {
      setServiceRadius(value);
    }
  }, [serviceRadius]);

  // Handle delete service
  const handleDeleteService = useCallback((serviceId) => {
    setCurrentServices(prevServices => prevServices.filter(service => service.id !== serviceId));
  }, []);

  // Handle edit service
  const handleEditService = useCallback((serviceId) => {
    console.log('Edit button pressed for service ID:', serviceId);
    // Find the service to edit
    const serviceToEdit = currentServices.find(service => service.id === serviceId);
    if (serviceToEdit) {
      console.log('Found service to edit:', serviceToEdit);
      setEditingService(serviceToEdit);
      setShowEditModal(true);
    } else {
      console.log('Service not found for ID:', serviceId);
    }
  }, [currentServices]);

  // Handle save edited service
  const handleSaveEditedService = useCallback(() => {
    if (!editingService) return;
    
    const updatedService = {
      ...editingService,
      name: editingService.name,
      price: editingService.price
    };
    
    setCurrentServices(prevServices => 
      prevServices.map(service => 
        service.id === editingService.id ? updatedService : service
      )
    );
    
    setShowEditModal(false);
    setEditingService(null);
  }, [editingService]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingService(null);
  }, []);

  const openTimePicker = (type) => {
    setTimePickerType(type);
    if (type === 'start') {
      const [time, ampm] = startTime.split(' ');
      const [hours, minutes] = time.split(':');
      setTempHour(parseInt(hours));
      setTempMinute(parseInt(minutes));
      setTempAmPm(ampm);
    } else {
      const [time, ampm] = endTime.split(' ');
      const [hours, minutes] = time.split(':');
      setTempHour(parseInt(hours));
      setTempMinute(parseInt(minutes));
      setTempAmPm(ampm);
    }
    setShowTimePicker(true);
  };

  const confirmTime = () => {
    const displayMinutes = tempMinute.toString().padStart(2, '0');
    const newTime = `${tempHour}:${displayMinutes} ${tempAmPm}`;
    
    if (timePickerType === 'start') {
      setStartTime(newTime);
    } else {
      setEndTime(newTime);
    }
    setShowTimePicker(false);
  };

  const cancelTime = () => {
    setShowTimePicker(false);
  };

  // Handle add/update service
  const handleAddOrUpdateService = useCallback(() => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      console.log('Empty service name or price, not adding');
      return; // Don't add empty services
    }

    if (editingServiceId) {
      // Update existing service
      console.log('Updating existing service with ID:', editingServiceId);
      setCurrentServices(prevServices => 
        prevServices.map(service => 
          service.id === editingServiceId 
            ? { ...service, name: serviceName, price: `₹${servicePrice}` }
            : service
        )
      );
      setEditingServiceId(null);
    } else {
      // Add new service
      const newService = {
        id: Date.now(),
        name: serviceName.trim(),
        description: 'Service description', // You can add a description field if needed
        price: `₹${servicePrice.trim()}`
      };
      console.log('Adding new service:', newService);
      setCurrentServices(prevServices => {
        const updatedServices = [...prevServices, newService];
        console.log('Updated services list:', updatedServices);
        return updatedServices;
      });
    }

    // Clear form
    setServiceName('');
    setServicePrice('');
  }, [serviceName, servicePrice, editingServiceId]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF4D4F', '#FF6B6B']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Image source={backArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability Status</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Working Hours Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.clockIcon}>🕐</Text>
            <Text style={styles.cardTitle}>Working Hours</Text>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openTimePicker('start')}
              >
                <Text style={styles.timeText}>{startTime}</Text>
                <Text style={styles.timePickerIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openTimePicker('end')}
              >
                <Text style={styles.timeText}>{endTime}</Text>
                <Text style={styles.timePickerIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.currentHours}>Current hours: 09:00 - 18:00</Text>
        </View>

        {/* Service Radius Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.cardTitle}>Service Radius</Text>
          </View>
          <Text style={styles.radiusText}>Service Area: {serviceRadius} km</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${Math.max(0, Math.min(100, ((serviceRadius - 1) / 49) * 100))}%` }]} />
              <View style={[
                styles.sliderThumb, 
                { 
                  left: `${Math.max(0, Math.min(100, ((serviceRadius - 1) / 49) * 100))}%`,
                  transform: [{ scale: isDragging ? 1.2 : 1 }]
                }
              ]}>
                <View style={styles.thumbInner} />
              </View>
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1 km</Text>
              <Text style={styles.sliderLabel}>50 km</Text>
            </View>
            {/* Quick preset buttons */}
            <View style={styles.presetButtons}>
              <TouchableOpacity 
                style={[styles.presetButton, serviceRadius === 5 && styles.presetButtonActive]}
                onPress={() => handlePresetChange(5)}
              >
                <Text style={[styles.presetButtonText, serviceRadius === 5 && styles.presetButtonTextActive]}>5 km</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.presetButton, serviceRadius === 10 && styles.presetButtonActive]}
                onPress={() => handlePresetChange(10)}
              >
                <Text style={[styles.presetButtonText, serviceRadius === 10 && styles.presetButtonTextActive]}>10 km</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.presetButton, serviceRadius === 25 && styles.presetButtonActive]}
                onPress={() => handlePresetChange(25)}
              >
                <Text style={[styles.presetButtonText, serviceRadius === 25 && styles.presetButtonTextActive]}>25 km</Text>
              </TouchableOpacity>
            </View>
            {/* Optimized touch overlay with proper drag support */}
            <TouchableOpacity 
              style={styles.sliderTouchOverlay}
              onPress={handleSliderPress}
              onPressIn={handleDragStart}
              onPressOut={handleDragEnd}
              activeOpacity={1}
            />
          </View>
          <Text style={styles.radiusDescription}>
            You will receive requests within {serviceRadius} km of your location
          </Text>
        </View>

        {/* Add New Service Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.serviceIcon}>🛠️</Text>
            <Text style={styles.cardTitle}>
              {editingServiceId ? 'Edit Service' : 'Add New Service'}
            </Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Service Name"
            placeholderTextColor="#B0B0B0"
            value={serviceName}
            onChangeText={setServiceName}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Price (₹)"
            placeholderTextColor="#B0B0B0"
            value={servicePrice}
            onChangeText={setServicePrice}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addServiceBtn} onPress={handleAddOrUpdateService}>
            <Text style={styles.addServiceBtnText}>
              {editingServiceId ? 'Update Service' : '＋  Add Service'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Services Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image source={customerIcon} style={styles.customerIcon} />
            <Text style={styles.cardTitle}>Current Services</Text>
          </View>
          {currentServices.map(service => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceNameRow}>
                  <Image source={serviceIcon} style={styles.serviceNameIcon} />
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.servicePrice}>Price : {service.price}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    console.log('Edit button tapped for service:', service.name);
                    handleEditService(service.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteService(service.id)}
                >
                  <Image source={deleteIcon} style={styles.deleteIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>






      </ScrollView>

      {/* Custom Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelTime}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <Text style={styles.timePickerTitle}>
              {timePickerType === 'start' ? 'Select Start Time' : 'Select End Time'}
            </Text>
            
            <View style={styles.timePickerContent}>
              <View style={styles.timePickerRow}>
                <Text style={styles.timePickerLabel}>Hour:</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempHour(tempHour === 12 ? 1 : tempHour + 1)}
                  >
                    <Text style={styles.pickerButtonText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{tempHour}</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempHour(tempHour === 1 ? 12 : tempHour - 1)}
                  >
                    <Text style={styles.pickerButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.timePickerRow}>
                <Text style={styles.timePickerLabel}>Minute:</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempMinute(tempMinute === 59 ? 0 : tempMinute + 1)}
                  >
                    <Text style={styles.pickerButtonText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{tempMinute.toString().padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempMinute(tempMinute === 0 ? 59 : tempMinute - 1)}
                  >
                    <Text style={styles.pickerButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.timePickerRow}>
                <Text style={styles.timePickerLabel}>AM/PM:</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempAmPm(tempAmPm === 'AM' ? 'PM' : 'AM')}
                  >
                    <Text style={styles.pickerButtonText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{tempAmPm}</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setTempAmPm(tempAmPm === 'AM' ? 'PM' : 'AM')}
                  >
                    <Text style={styles.pickerButtonText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.timePickerButtons}>
              <TouchableOpacity style={styles.cancelTimeButton} onPress={cancelTime}>
                <Text style={styles.cancelTimeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmTimeButton} onPress={confirmTime}>
                <Text style={styles.confirmTimeButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Service</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {editingService && (
              <>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Service Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editingService.name}
                    onChangeText={(text) => setEditingService({...editingService, name: text})}
                    placeholder="Service Name"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>
                
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Price (₹)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editingService.price.replace('₹', '')}
                    onChangeText={(text) => setEditingService({...editingService, price: `₹${text}`})}
                    placeholder="Price"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Description</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60 }]}
                    value={editingService.description}
                    onChangeText={(text) => setEditingService({...editingService, description: text})}
                    placeholder="Service Description"
                    placeholderTextColor="#B0B0B0"
                    multiline
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditedService}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
            </Modal>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clockIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  serviceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  customerIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    paddingBottom:10
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeField: {
    flex: 1,
    marginRight: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeText: {
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Medium',
  },
  timePickerIcon: {
    fontSize: 16,
  },
  currentHours: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  radiusText: {
    fontSize: 16,
    color: '#22223B',
    marginBottom: 16,
    fontFamily: 'Poppins-Medium',
  },
  sliderContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  sliderTouchOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'transparent',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'relative',
    marginBottom: 8,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#2563EB',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    top: -9,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  radiusDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#2563EB',
  },
  presetButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  presetButtonTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 15,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
    paddingLeft:15
  },
  addServiceBtn: {
    backgroundColor: '#3887F6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addServiceBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceNameIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
    fontFamily: 'Poppins-Bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: '#FF4D4F',
  },



  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  modalTextInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 15,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  
  // Custom Time Picker Styles
  timePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContent: {
    marginBottom: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timePickerLabel: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
  },
  pickerButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pickerButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  pickerValue: {
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Medium',
    minWidth: 40,
    textAlign: 'center',
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelTimeButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelTimeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  confirmTimeButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmTimeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});
