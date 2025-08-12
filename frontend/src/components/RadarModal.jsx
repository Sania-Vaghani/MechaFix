import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, StatusBar, Alert } from 'react-native';

const RADAR_SIZE = 250; // fills the modal better
const MECHANIC_COUNT = 5;
const PRIMARY = '#E53935';
const SECONDARY = '#FF4D4F';
const BLUE = '#2563EB';
const BLUE_SOFT = 'rgba(37, 99, 235, 0.12)';
const BG = '#fff';
const TEXT = '#22223B';

function randomPolar(radius) {
  const angle = Math.random() * 2 * Math.PI;
  const r = Math.random() * (radius - 36) + 36;
  return {
    x: RADAR_SIZE / 2 + r * Math.cos(angle) - 12,
    y: RADAR_SIZE / 2 + r * Math.sin(angle) - 12,
  };
}

const RadarModal = ({ visible, onClose, onNoMechanicsFound }) => {
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const radarPulse = useRef(new Animated.Value(1)).current;
  const [mechanicDots, setMechanicDots] = useState([]);
  const dotOpacities = useRef([...Array(MECHANIC_COUNT)].map(() => new Animated.Value(0))).current;
  const dotPulses = useRef([...Array(MECHANIC_COUNT)].map(() => new Animated.Value(1))).current;
  const timerRef = useRef(null); // Add timer reference

  useEffect(() => {
    let sweepLoop, radarPulseLoop, dotPulseLoops = [];
    if (visible) {
      setMechanicDots(Array.from({ length: MECHANIC_COUNT }, () => randomPolar(RADAR_SIZE / 2 - 16)));

      // Start 10-second timer
      timerRef.current = setTimeout(() => {
        // First close the radar modal
        onClose();
        
        // Then show phone message and open FoundMechanic
        if (onNoMechanicsFound) {
          onNoMechanicsFound();
        }
      }, 10000);

      sweepAnim.setValue(0);
      sweepLoop = Animated.loop(
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 3200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      sweepLoop.start();

      radarPulse.setValue(1);
      radarPulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(radarPulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(radarPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      radarPulseLoop.start();

      dotOpacities.forEach(opacity => opacity.setValue(0));
      dotPulses.forEach(pulse => pulse.setValue(1));
      dotOpacities.forEach((opacity, i) => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            dotPulseLoops[i] = Animated.loop(
              Animated.sequence([
                Animated.timing(dotPulses[i], { toValue: 1.18, duration: 800, useNativeDriver: true }),
                Animated.timing(dotPulses[i], { toValue: 1, duration: 800, useNativeDriver: true }),
              ])
            );
            dotPulseLoops[i].start();
          });
        }, 700 + i * 600);
      });
    }
    return () => {
      // Clear timer when component unmounts or modal closes
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      sweepLoop && sweepLoop.stop();
      radarPulseLoop && radarPulseLoop.stop();
      dotPulseLoops.forEach(loop => loop && loop.stop && loop.stop());
      sweepAnim.setValue(0);
      radarPulse.setValue(1);
      dotOpacities.forEach(opacity => opacity.setValue(0));
      dotPulses.forEach(pulse => pulse.setValue(1));
    };
  }, [visible, onClose, onNoMechanicsFound]); // Add onClose to dependency array

  const rotate = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(screenWidth - 24, 400); // was - 32, 380

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.35)" barStyle="dark-content" translucent />
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { width: modalWidth }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <Text style={styles.headerIcon}>🛠️</Text>
              </View>
              <View>
                <Text style={styles.heading}>MECHANIC RADAR</Text>
                <Text style={styles.subheading}>Live mechanic scan in progress</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerUnderline} />

          {/* Radar */}
          <View style={styles.radarContainer}>
            <Animated.View
              style={[
                styles.radar,
                { transform: [{ scale: radarPulse }] }
              ]}
            >
              <View style={styles.glass} />
              <View style={styles.blueRing} />
              {[1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.circle,
                    {
                      width: (RADAR_SIZE / 2) * i,
                      height: (RADAR_SIZE / 2) * i,
                      left: (RADAR_SIZE - (RADAR_SIZE / 2) * i) / 2,
                      top: (RADAR_SIZE - (RADAR_SIZE / 2) * i) / 2,
                    },
                  ]}
                />
              ))}
              {[0, 1].map(i => (
                <View
                  key={i}
                  style={[
                    styles.crossLine,
                    {
                      transform: [{ rotate: `${i * 90}deg` }],
                      left: RADAR_SIZE / 2,
                      top: 0,
                    },
                  ]}
                />
              ))}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (2 * Math.PI * i) / 24;
                const length = i % 6 === 0 ? 16 : 8;
                return (
                  <View
                    key={i}
                    style={[
                      styles.tick,
                      {
                        left: RADAR_SIZE / 2 - 1,
                        top: 2,
                        width: 2,
                        height: length,
                        backgroundColor: PRIMARY,
                        opacity: 0.18,
                        transform: [
                          { rotate: `${(angle * 180) / Math.PI}deg` },
                          { translateY: 0 },
                        ],
                      },
                    ]}
                  />
                );
              })}
              <Animated.View
                style={[
                  styles.sweep,
                  {
                    width: RADAR_SIZE,
                    height: RADAR_SIZE,
                    borderRadius: RADAR_SIZE / 2,
                    left: 0,
                    top: 0,
                    transform: [{ rotate }],
                  },
                ]}
              />
              <View style={styles.centerDotGlow} />
              <View style={styles.centerDot} />
              {mechanicDots.map((pos, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.mechanicDot,
                    {
                      left: pos.x,
                      top: pos.y,
                      opacity: dotOpacities[i],
                      transform: [{ scale: dotPulses[i] }],
                    },
                  ]}
                />
              ))}
            </Animated.View>
            <Text style={styles.message}>
              Detecting nearby <Text style={styles.messageBlue}>mechanics</Text>, wait for <Text style={styles.messageBlue}>10 seconds</Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: BG,
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
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
    gap: 10,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BLUE_SOFT, // was red-tinted
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerIcon: {
    fontSize: 22,
  },
  heading: {
    fontSize: 22,
    color: TEXT,
    fontFamily: 'Cormorant-Bold',
    marginBottom: 0,
  },
  subheading: {
    fontSize: 13,
    color: BLUE,                // was gray/red
    fontFamily: 'Poppins-Regular',
    marginTop: 0,
    opacity: 0.95,
  },
  headerUnderline: {
    width: '100%',
    height: 3,
    backgroundColor: BLUE_SOFT, // blue accent line
    borderRadius: 2,
    marginBottom: 8,   // was 12
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,      // was 8
    marginBottom: 4,   // was 8
  },
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    backgroundColor: '#f8f8f8',
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 2,
    borderColor: PRIMARY,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 25,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 25,
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: RADAR_SIZE / 2,
    zIndex: 0,
  },
  blueRing: {
    position: 'absolute',
    width: RADAR_SIZE * 0.96,
    height: RADAR_SIZE * 0.96,
    left: RADAR_SIZE * 0.02,
    top: RADAR_SIZE * 0.02,
    borderRadius: (RADAR_SIZE * 0.96) / 2,
    borderWidth: 1,
    borderColor: BLUE,
    opacity: 0.18,
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    borderColor: PRIMARY,
    borderWidth: 1,
    borderRadius: 999,
    opacity: 0.18,
  },
  crossLine: {
    position: 'absolute',
    width: 2,
    height: RADAR_SIZE,
    backgroundColor: PRIMARY,
    opacity: 0.10,
    left: RADAR_SIZE / 2 - 1,
    top: 0,
  },
  tick: {
    position: 'absolute',
    borderRadius: 1,
  },
  sweep: {
    position: 'absolute',
    backgroundColor: 'rgba(229, 57, 53, 0.13)',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderTopRightRadius: RADAR_SIZE,
    borderBottomRightRadius: RADAR_SIZE,
    left: 0,
    top: 0,
    zIndex: 2,
    borderLeftWidth: RADAR_SIZE / 2,
    borderLeftColor: 'transparent',
    borderTopWidth: RADAR_SIZE / 2,
    borderTopColor: 'rgba(229, 57, 53, 0.13)',
  },
  centerDotGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    left: RADAR_SIZE / 2 - 18,
    top: RADAR_SIZE / 2 - 18,
    opacity: 0.12,
    zIndex: 3,
  },
  centerDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY,
    left: RADAR_SIZE / 2 - 9,
    top: RADAR_SIZE / 2 - 9,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 4,
    opacity: 0.9,
  },
  mechanicDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SECONDARY,
    borderWidth: 4,
    borderColor: '#fff',
    zIndex: 5,
    shadowColor: BLUE,   // subtle blue glow instead of red glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 6,      // was 8
    fontSize: 18,
    color: TEXT,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
    fontWeight: 'bold',
    textShadowColor: 'rgba(229, 57, 53, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  messageBlue: {
    color: BLUE,
    fontWeight: '700',
  },
  closeButton: {
    padding: 12,           // Increase padding for a bigger touch area
    borderRadius: 20,      // Slightly larger for a rounder button
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 36,          // Increase from 28 to 36 (or higher if you want)
    color: '#333',      // Or use your ACCENT variable
    fontWeight: '300',
    lineHeight: 36,        // Match fontSize for vertical centering
  },
});

export default RadarModal;
