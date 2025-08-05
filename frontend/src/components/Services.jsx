import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import backArrowIcon from '../images/arrow.png';
import addIcon from '../images/add.png';
import deleteIcon from '../images/delete.png';

export default function Services() {
  const navigation = useNavigation();
  const [mechanicName, setMechanicName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Sample team data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Raj Kumar',
      phone: '+91 9876543210',
      experience: '5 years',
      specialization: 'Engine Repair'
    },
    {
      id: 2,
      name: 'Amit Singh',
      phone: '+91 9876543211',
      experience: '3 years',
      specialization: 'Electrical'
    }
  ]);

  const handleAddMechanic = () => {
    if (!mechanicName.trim() || !phoneNumber.trim()) {
      return; // Don't add empty entries
    }

    // Create new mechanic with default experience and specialization
    const newMechanic = {
      id: Date.now(), // Generate unique ID
      name: mechanicName.trim(),
      phone: phoneNumber.trim(),
      experience: '2 years', // Default experience
      specialization: 'General Repair' // Default specialization
    };

    // Add to team members list
    setTeamMembers(prevMembers => [...prevMembers, newMechanic]);

    // Clear form after submission
    setMechanicName('');
    setPhoneNumber('');
  };

  const handleDeleteMechanic = (id) => {
    console.log('Deleting mechanic with ID:', id);
    setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== id));
  };

  const handleEditMechanic = (id) => {
    console.log('Editing mechanic with ID:', id);
    const memberToEdit = teamMembers.find(member => member.id === id);
    if (memberToEdit) {
      setEditingMember({ ...memberToEdit });
      setShowEditModal(true);
    }
  };

  const handleSaveEditedMember = () => {
    if (!editingMember) return;
    
    setTeamMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === editingMember.id ? editingMember : member
      )
    );
    
    setShowEditModal(false);
    setEditingMember(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingMember(null);
  };

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
        <Text style={styles.headerTitle}>Add New Mechanic</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add New Mechanic Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.formTitle}>Add New Mechanic</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mechanic Name"
              value={mechanicName}
              onChangeText={setMechanicName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                // Only allow digits and limit to 10 characters
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText.length <= 10) {
                  setPhoneNumber(numericText);
                }
              }}
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddMechanic}>
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Add Mechanic</Text>
          </TouchableOpacity>
        </View>

        {/* Current Team Section */}
        <View style={styles.teamCard}>
          <Text style={styles.teamTitle}>Current Team</Text>
          {teamMembers.map((member) => (
            <View key={member.id} style={styles.teamMemberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.avatarText}>{member.name.split(' ')[0][0]}</Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberPhone}>+91 {member.phone}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditMechanic(member.id)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMechanic(member.id)}
                >
                  <Image source={deleteIcon} style={styles.deleteIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Edit Member Modal */}
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
              <Text style={styles.modalTitle}>Edit Team Member</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {editingMember && (
              <>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editingMember.name}
                    onChangeText={(text) => setEditingMember({...editingMember, name: text})}
                    placeholder="Member Name"
                    placeholderTextColor="#B0B0B0"
                  />
                </View>
                
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editingMember.phone}
                    onChangeText={(text) => setEditingMember({...editingMember, phone: text})}
                    placeholder="Phone Number"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditedMember}>
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addIcon: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: 'bold',
    marginRight: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fff',
  },

  addButton: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  addButtonIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  editButtonText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 20,
    height: 20,
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
});
