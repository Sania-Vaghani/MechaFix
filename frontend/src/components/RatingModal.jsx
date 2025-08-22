import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Enhanced design constants
const PRIMARY = '#E53935';
const SECONDARY = '#FF4D4F';
const BLUE = '#2563EB';
const BLUE_SOFT = 'rgba(37, 99, 235, 0.12)';
const BG = '#fff';
const TEXT = '#22223B';
const GOLD = '#F59E0B';
const GOLD_SOFT = 'rgba(245, 158, 11, 0.1)';
const SUCCESS = '#10B981';
const SUCCESS_SOFT = 'rgba(16, 185, 129, 0.1)';

export default function RatingModal({ visible, onClose, onSubmit, mechanicName, serviceType, workerName, garageName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation refs
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const starAnimations = useRef([...Array(5)].map(() => new Animated.Value(1))).current;
  const submitButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);
    }
  }, [visible]);

  const animateStar = (index) => {
    Animated.sequence([
      Animated.timing(starAnimations[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(starAnimations[index], {
        toValue: 1,
        duration: 150,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating);
    // Animate the selected star
    animateStar(selectedRating - 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    
    if (comment.trim().length < 3) {
      Alert.alert('Comment Required', 'Please provide a comment (at least 3 characters).');
      return;
    }

    setIsSubmitting(true);
    
    // Animate submit button
    Animated.sequence([
      Animated.timing(submitButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onSubmit({ rating, comment });
      // Reset form
      setRating(0);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isSelected = rating >= i;
      const isHovered = rating === i;
      
      stars.push(
        <Animated.View
          key={i}
          style={[
            styles.starContainer,
            { transform: [{ scale: starAnimations[i - 1] }] }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleRatingPress(i)}
            style={[
              styles.starButton,
              isSelected && styles.starButtonSelected,
              isHovered && styles.starButtonHovered
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.star,
              isSelected ? styles.starFilled : styles.starEmpty
            ]}>
              ★
            </Text>
            {isSelected && (
              <View style={styles.starGlow} />
            )}
          </TouchableOpacity>
        </Animated.View>
      );
    }
    return stars;
  };

  const getRatingEmoji = () => {
    if (rating >= 4) return '😊';
    if (rating >= 3) return '😐';
    if (rating >= 2) return '😕';
    if (rating >= 1) return '😞';
    return '🤔';
  };

  const getRatingText = () => {
    if (rating >= 4) return 'Excellent!';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    if (rating >= 1) return 'Poor';
    return 'Select Rating';
  };

  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(screenWidth - 24, 400);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.35)" barStyle="dark-content" translucent />
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: modalOpacity }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            { 
              width: modalWidth,
              transform: [{ scale: modalScale }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[PRIMARY, SECONDARY]}
                style={styles.headerIconCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.headerIcon}>⭐</Text>
              </LinearGradient>
              <View>
                <Text style={styles.heading}>
                  <Text style={styles.headingRed}>RATE</Text> EXPERIENCE
                </Text>
                <Text style={styles.subheading}>Share your feedback with us</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerUnderline} />

          {/* Content */}
          <View style={styles.content}>
            {/* Service Information Card */}
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.infoCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>🛠️</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.serviceInfo}>
                  {serviceType || 'Vehicle Repair'}
                </Text>
                {workerName && (
                  <Text style={styles.mechanicInfo}>
                    Worker: {workerName}
                  </Text>
                )}
                {garageName && (
                  <Text style={styles.mechanicInfo}>
                    Garage: {garageName}
                  </Text>
                )}
                {!workerName && !garageName && (
                  <Text style={styles.mechanicInfo}>
                    Mechanic: {mechanicName || 'Service Provider'}
                  </Text>
                )}
              </View>
            </LinearGradient>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>How would you rate this service?</Text>
              
              {/* Rating Emoji Display */}
              {rating > 0 && (
                <View style={styles.ratingEmojiContainer}>
                  <Text style={styles.ratingEmoji}>{getRatingEmoji()}</Text>
                  <Text style={styles.ratingText}>{getRatingText()}</Text>
                </View>
              )}
              
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              
              {rating > 0 && (
                <View style={styles.ratingDisplay}>
                  <View style={styles.ratingBarContainer}>
                    <View style={styles.ratingBar}>
                      <LinearGradient
                        colors={[GOLD, '#F59E0B']}
                        style={[styles.ratingFill, { width: `${(rating / 5) * 100}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={styles.ratingNumber}>{rating}/5</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.commentTitle}>Tell us about your experience</Text>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your feedback (minimum 3 characters)"
                  placeholderTextColor="#9CA3AF"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <View style={styles.charCountContainer}>
                  <Text style={[
                    styles.charCount,
                    comment.length >= 3 ? styles.charCountValid : styles.charCountInvalid
                  ]}>
                    {comment.length}/500
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: submitButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating === 0 || comment.trim().length < 3 || isSubmitting) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || comment.trim().length < 3 || isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    rating === 0 || comment.trim().length < 3 || isSubmitting 
                      ? ['#9CA3AF', '#6B7280'] 
                      : [SUCCESS, '#059669']
                  }
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: BG,
    borderRadius: 32,
    padding: 28,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  heading: {
    fontSize: 20,
    color: TEXT,
    fontFamily: 'Cormorant-Bold',
    marginBottom: 0,
    letterSpacing: 0.5,
  },
  headingRed: {
    color: PRIMARY,
  },
  subheading: {
    fontSize: 12,
    color: PRIMARY,
    fontFamily: 'Poppins-Regular',
    marginTop: 0,
    opacity: 0.9,
  },
  headerUnderline: {
    width: '100%',
    height: 3,
    backgroundColor: PRIMARY,
    borderRadius: 2,
    marginBottom: 24,
  },
  content: {
    width: '100%',
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  serviceInfo: {
    fontSize: 16,
    color: TEXT,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 6,
  },
  mechanicInfo: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 3,
  },
  ratingSection: {
    marginBottom: 28,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  ratingEmojiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: GOLD_SOFT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: TEXT,
    fontFamily: 'Poppins-SemiBold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starContainer: {
    marginHorizontal: 6,
  },
  starButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starButtonSelected: {
    backgroundColor: GOLD_SOFT,
  },
  starButtonHovered: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  star: {
    fontSize: 44,
    color: '#E5E7EB',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starFilled: {
    color: GOLD,
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  starEmpty: {
    color: '#E5E7EB',
  },
  starGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GOLD,
    opacity: 0.2,
    zIndex: -1,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginTop: 8,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBar: {
    width: 120,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ratingFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingNumber: {
    fontSize: 14,
    color: TEXT,
    fontFamily: 'Poppins-SemiBold',
    backgroundColor: GOLD_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentSection: {
    marginBottom: 28,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  commentInputContainer: {
    position: 'relative',
  },
  commentInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 18,
    fontSize: 14,
    color: TEXT,
    backgroundColor: '#F9FAFB',
    minHeight: 120,
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  charCountContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  charCountValid: {
    color: SUCCESS,
  },
  charCountInvalid: {
    color: '#9CA3AF',
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: SUCCESS,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  closeText: {
    fontSize: 28,
    color: '#374151',
    fontWeight: '300',
    lineHeight: 28,
  },
}); 