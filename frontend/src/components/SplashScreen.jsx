import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing, Dimensions, Platform } from 'react-native';
import CustomText from '../../Components/CustomText';
import LinearGradient from 'react-native-linear-gradient';

const { height, width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const carAnim = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const infoFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });

    const fadeAnimation = Animated.stagger(300, [
      Animated.timing(logoFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(titleFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(taglineFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(infoFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);

    Animated.parallel([
      fadeIn,
      fadeAnimation,
      Animated.loop(
        Animated.timing(carAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
    ]).start();

    // Navigate to UserTypeSelection after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('UserTypeSelection');
    }, 3000);
    return () => clearTimeout(timer);
  }, [fadeAnim, carAnim, logoFade, titleFade, taglineFade, infoFade, navigation]);

  const carTranslateX = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 500], // Start from off-screen left, end off-screen right
  });

  return (
    <LinearGradient
      colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative Dots in Gradient Background */}
      <View pointerEvents="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <View style={{ position: 'absolute', top: 40, left: 30, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E53935', opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: 120, right: 40, width: 22, height: 22, borderRadius: 11, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', bottom: 80, left: 60, width: 16, height: 16, borderRadius: 8, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 140, right: 20, width: 24, height: 24, borderRadius: 12, backgroundColor: '#E53935', opacity: 0.20 }} />
        <View style={{ position: 'absolute', top: 200, left: 100, width: 14, height: 14, borderRadius: 7, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 260, right: 80, width: 19, height: 19, borderRadius: 9.5, backgroundColor: '#a1c4fd', opacity: 0.21 }} />
        <View style={{ position: 'absolute', bottom: 200, left: 120, width: 20, height: 20, borderRadius: 10, backgroundColor: '#E53935', opacity: 0.19 }} />
        <View style={{ position: 'absolute', bottom: 40, right: 100, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#a1c4fd', opacity: 0.22 }} />
        <View style={{ position: 'absolute', top: 320, left: 180, width: 17, height: 17, borderRadius: 8.5, backgroundColor: '#a1c4fd', opacity: 0.23 }} />
        <View style={{ position: 'absolute', bottom: 260, right: 140, width: 21, height: 21, borderRadius: 10.5, backgroundColor: '#E53935', opacity: 0.21 }} />
      </View>

      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.logoPlaceholder, { opacity: logoFade }]}>
            <CustomText style={styles.logoText}>M</CustomText>
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: titleFade }]}>MechaFix</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>CAR SERVICES MADE SMART</Animated.Text>

        <Animated.View style={[styles.infoSection, { opacity: infoFade }]}>
            <CustomText style={styles.infoText}>700+ Service Centers</CustomText>
            <CustomText style={styles.infoTextBold}>World Wide</CustomText>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.bottomIllustration, { opacity: fadeAnim }]}>
        <View style={styles.cityscape} />
        <Animated.View style={[styles.car, { transform: [{ translateX: carTranslateX }] }]}>
            <View style={styles.carBody} />
            <View style={styles.carRoof} />
            <View style={styles.wheelContainer}>
                <View style={styles.wheel} />
                <View style={styles.wheel} />
            </View>
        </Animated.View>
        <View style={[styles.road, { width: width }]} />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: -100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 60,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  title: {
    fontSize: 48,
    color: '#333',
    fontFamily: 'Cormorant-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 23,
    color: '#555',
    letterSpacing: 2,
    marginTop: 8,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  infoSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 19,
    color: '#444',
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
  infoTextBold: {
    fontSize: 19,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  bottomIllustration: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  cityscape: {
    width: '100%',
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  road: {
    width: '100%',
    height: 80,
    backgroundColor: '#666',
  },
  car: {
    width: 80,
    height: 45,
    zIndex: 1,
    position: 'absolute',
    bottom: 60,
  },
  carBody: {
    position: 'absolute',
    bottom: 10,
    width: 80,
    height: 25,
    backgroundColor: '#E53935',
    borderRadius: 5,
  },
  carRoof: {
    position: 'absolute',
    top: -3,
    left: 15,
    width: 50,
    height: 18,
    backgroundColor: '#92A5A6',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  wheelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wheel: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#FFF',
  }
});

export default SplashScreen;
