import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import sosIcon from '../images/sos.png';
import locIcon from '../images/loc.png';

const { width } = Dimensions.get('window');

const SOSButtonOverlay = ({ visible, onClose }) => {
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
      const timer = setTimeout(() => {
        ringAnim.stopAnimation();
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
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
  );
};

const styles = StyleSheet.create({
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
  sosLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  locationIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
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
});

export default SOSButtonOverlay; 