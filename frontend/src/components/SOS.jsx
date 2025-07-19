import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, Animated, Easing, Dimensions, Linking, Alert } from 'react-native';
import arrowIcon from '../images/arrow.png';
import sosIcon from '../images/sos.png';
import phoneIcon from '../images/phone.png';
import locIcon from '../images/loc.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

const { width } = Dimensions.get('window');

const initialEmergencyContacts = [
  { name: 'Police', number: '100', color: '#2563EB', type: 'static' },
  { name: 'Ambulance', number: '108', color: '#22C55E', type: 'static' },
  { name: 'Fire Department', number: '101', color: '#F97316', type: 'static' },
  // User contacts will be added dynamically
];

const SOS = ({ navigation }) => {
  const [contacts, setContacts] = useState(initialEmergencyContacts);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [modalContactIdx, setModalContactIdx] = useState(null);
  const [inputName, setInputName] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [error, setError] = useState('');
  const [showSOSMessage, setShowSOSMessage] = useState(false);
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserContacts = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      try {
        const res = await API.get('users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userContacts = (res.data.emergency_contacts || []).map((c, idx) => ({
          name: c.name || `Emergency Contact ${idx + 1}`,
          number: c.number || '',
          color: '#FF4D4F',
          type: 'user'
        }));
        setContacts([
          ...initialEmergencyContacts,
          ...userContacts
        ]);
      } catch (err) {
        // If error, just show static contacts
        setContacts(initialEmergencyContacts);
      }
    };
    fetchUserContacts();
  }, []);

  // Filter user contacts
  const userContacts = contacts.filter(c => c.type === 'user');

  // Open modal for add or edit
  const openModal = (mode, idx = null) => {
    setModalMode(mode);
    setModalContactIdx(idx);
    if (mode === 'edit' && idx !== null) {
      setInputName(userContacts[idx].name.replace(/Emergency Contact \d+/, ''));
      setInputNumber(userContacts[idx].number.replace('+91 ', ''));
    } else {
      setInputName('');
      setInputNumber('');
    }
    setError('');
    setModalVisible(true);
  };

  const saveUserContactsToBackend = async (userContacts) => {
    const token = await AsyncStorage.getItem('jwtToken');
    try {
      await API.patch('users/me/', {
        emergency_contacts: userContacts.map(c => ({
          name: c.name,
          number: c.number
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally, show a success message or refetch contacts
    } catch (err) {
      Alert.alert('Error', 'Failed to update emergency contacts.');
    }
  };

  // Add or update contact
  const handleSaveContact = () => {
    const trimmedName = inputName.trim();
    const trimmedNumber = inputNumber.trim();
    if (!trimmedName) {
      setError('Name is required');
      return;
    }
    if (!/^\d{10}$/.test(trimmedNumber)) {
      setError('Number must be exactly 10 digits');
      return;
    }
    const fullNumber = '+91 ' + trimmedNumber;
    // Check uniqueness
    const otherNumbers = userContacts
      .filter((_, i) => modalMode === 'edit' ? i !== modalContactIdx : true)
      .map(c => c.number);
    if (otherNumbers.includes(fullNumber)) {
      setError('This number is already used in another emergency contact');
      return;
    }
    let updatedUserContacts;
    if (modalMode === 'add') {
      updatedUserContacts = [
        ...userContacts,
        { name: trimmedName, number: fullNumber, color: '#FF4D4F', type: 'user' }
      ];
    } else if (modalMode === 'edit' && modalContactIdx !== null) {
      let count = 0;
      updatedUserContacts = userContacts.map((c, idx) => {
        if (count === modalContactIdx) {
          count++;
          return { ...c, name: trimmedName, number: fullNumber };
        }
        count++;
        return c;
      });
    }
    // Update local state
    setContacts(prev => [
      ...initialEmergencyContacts,
      ...updatedUserContacts
    ]);
    setModalVisible(false);
    // Save to backend
    saveUserContactsToBackend(updatedUserContacts);
  };

  // Delete handler
  const handleDelete = (name) => {
    const updatedUserContacts = userContacts.filter(c => c.name !== name);
    setContacts(prev => [
      ...initialEmergencyContacts,
      ...updatedUserContacts
    ]);
    saveUserContactsToBackend(updatedUserContacts);
  };

  // SOS Button Handler
  const handleSOS = () => {
    setShowSOSMessage(true);
    ringAnim.setValue(0);
    Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: 4 }
    ).start();
    setTimeout(() => {
      setShowSOSMessage(false);
      ringAnim.stopAnimation();
    }, 5000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation && navigation.goBack && navigation.goBack()}>
          <Image source={arrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', position: 'relative' },styles.alignHead]}>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Emergency Contacts Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image source={phoneIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          </View>
          {contacts.map((contact, idx) => (
            <View key={contact.name} style={styles.contactRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
                {/* Show 'Change' and 'Delete' for user contacts only */}
                {contact.type === 'user' && (
                  <View style={styles.contactActionsRowAligned}>
                    <TouchableOpacity style={styles.changeBtn} onPress={() => openModal('edit', userContacts.findIndex(c => c.name === contact.name))}>
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(contact.name)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity style={[styles.callBtn, { backgroundColor: contact.color }]} 
                onPress={async () => {
                  let phoneNumber = contact.number.replace(/\D/g, '');
                  if (phoneNumber.length === 10) phoneNumber = '+91' + phoneNumber;
                  else if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;
                  const url = `tel:${phoneNumber}`;
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Calling is not supported on this device.');
                  }
                }}>
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          ))}
          {/* Add Emergency Contact Button */}
          {userContacts.length < 2 && (
            <TouchableOpacity style={styles.addBtn} onPress={() => openModal('add')}>
              <Text style={styles.addBtnText}>+ Add Emergency Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {/* SOS Message and Animation Overlay */}
      {showSOSMessage && (
        <View style={styles.sosModalOverlay} pointerEvents="auto">
          {[0, 1, 2].map(i => {
            const scale = ringAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1 + i * 0.2, 2.2 + i * 0.2],
            });
            const opacity = ringAnim.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.4 - i * 0.1, 0.15 - i * 0.05, 0],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.sosRing,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              />
            );
          })}
          <View style={styles.sosOverlayContent}>
            <View style={styles.sosMessageCardRedesigned}>
              <Image source={sosIcon} style={styles.sosMessageIcon} />
              <Text style={styles.sosMessageTitle}>Emergency SOS</Text>
              <View style={styles.sosLocationRow}>
                <Image source={locIcon} style={styles.locationIcon} />
                <Text style={styles.locationTitle}>Current Location Shared</Text>
              </View>
              <Text style={styles.locationDesc}>Your GPS location is automatically shared with emergency services</Text>
            </View>
            </View>
        </View>
      )}
      {/* SOS Button (fixed at bottom) */}
      {!showSOSMessage && (
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.85}>
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>
      )}
      {/* Modal for Add/Edit Emergency Contact */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Add' : 'Edit'} Emergency Contact</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Name"
                value={inputName}
                onChangeText={setInputName}
                maxLength={30}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="10-digit Number"
                value={inputNumber}
                onChangeText={text => setInputNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={10}
              />
              {error ? <Text style={styles.modalError}>{error}</Text> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveContact}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FF',
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
  sosIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    marginLeft: 2,
    tintColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 18,
    marginBottom: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#FF4D4F',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#22223B',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    color: '#22223B',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  contactNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  callBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  callBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  locationIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    // No tintColor, use original
  },
  locationTitle: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  locationDesc: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  changeBtn: {
    alignSelf: 'center',
    marginTop: 0,
    marginRight: 12,
    marginLeft:-80,
    borderWidth: 1.2,
    borderColor: '#FF4D4F',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  changeBtnText: {
    color: '#FF4D4F',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  contactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  deleteBtn: {
    borderWidth: 1.2,
    borderColor: '#FF4D4F',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginLeft: 0,
  },
  deleteBtnText: {
    color: '#FF4D4F',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  contactActionsRowAligned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  addBtn: {
    marginTop: 8,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
    backgroundColor: '#fff',
    shadowColor: '#22C55E',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4D4F',
    marginBottom: 16,
    fontFamily: 'Poppins-Bold',
  },
  modalInput: {
    borderWidth: 1.2,
    borderColor: '#FF4D4F',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  modalError: {
    color: '#FF4D4F',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1.2,
    borderColor: '#FF4D4F',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#FF4D4F',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
  },
  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FF4D4F',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
  },
  alignHead:{
    marginLeft:-25,
  },
  sosButton: {
    position: 'absolute',
    bottom: 130,
    left: width / 2 - 80,
    width: 180,
    height: 64,
    backgroundColor: '#FF4D4F',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  sosButtonIcon: {
    width: 38,
    height: 38,
    tintColor: '#FF4D4F',
    backgroundColor: '#fff',
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#fff',
    padding: 2,
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1,
  },
  sosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  sosAnimContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: '100%',
  },
  sosRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#FF4D4F',
    backgroundColor: 'rgba(255,77,79,0.08)',
    alignSelf: 'center',
  },
  sosMessageCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
  },
  sosMessageIcon: {
    width: 38,
    height: 38,
    marginBottom: 10,
    tintColor: '#FF4D4F',
  },
  sosMessageTitle: {
    fontSize: 22,
    color: '#22C55E',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  sosMessageDesc: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  locationCardOverlay: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'flex-start',
    minWidth: 260,
    maxWidth: 340,
  },
  sosModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  sosCombinedCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 320,
    maxWidth: 370,
  },
  sosMessageCardCombined: {
    alignItems: 'center',
    marginBottom: 18,
  },
  locationCardOverlayCombined: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'flex-start',
    minWidth: 260,
    maxWidth: 340,
  },
  sosOverlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sosMessageCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#FF4D4F',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
    maxWidth: 370,
    marginBottom: 18,
  },
  locationCardOverlayRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'flex-start',
    minWidth: 260,
    maxWidth: 340,
  },
  sosLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
});

export default SOS; 