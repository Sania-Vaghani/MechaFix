import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RatingModal({ visible, onClose, onSubmit, mechanicName, serviceType, workerName, garageName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    
    if (comment.trim().length < 3) {
      Alert.alert('Comment Required', 'Please provide a comment (at least 3 characters).');
      return;
    }

    onSubmit({ rating, comment });
    // Reset form
    setRating(0);
    setComment('');
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingPress(i)}
          style={styles.starContainer}
        >
          <Text style={[
            styles.star,
            rating >= i ? styles.starFilled : styles.starEmpty
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.75)" barStyle="light-content" translucent />
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Bottom Handle Indicator */}
          <View style={styles.bottomHandle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Rate Your Experience</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Service Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.serviceInfo}>
                Service: {serviceType || 'Completed'}
              </Text>
              {workerName && (
                <Text style={styles.mechanicInfo}>
                  Worker: {workerName}
                </Text>
              )}
              {!workerName && (
                <Text style={styles.mechanicInfo}>
                  Worker: {mechanicName || 'Service Provider'}
                </Text>
              )}
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>How would you rate this service?</Text>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  You rated: {rating} {rating === 1 ? 'star' : 'stars'}
                </Text>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.commentTitle}>Tell us about your experience</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your feedback (minimum 3 characters)"
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || comment.trim().length < 3) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || comment.trim().length < 3}
            >
              <Text style={styles.submitButtonText}>Submit Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    width: '95%',
    maxWidth: 400,
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
  },
  bottomHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
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
    backgroundColor: '#FF4D4F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'flex-end',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  content: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  serviceInfo: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  mechanicInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    fontFamily: 'Poppins-Regular',
  },
  ratingSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22223B',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starContainer: {
    marginHorizontal: 8,
  },
  star: {
    fontSize: 48,
    color: '#E5E7EB',
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: '#E5E7EB',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22223B',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    minHeight: 100,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
}); 