import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import CustomText from '../../Components/CustomText';

const { height, width } = Dimensions.get('window');

const SplashScreen = () => {
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
  }, [fadeAnim, carAnim, logoFade, titleFade, taglineFade, infoFade]);

  const carTranslateX = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 500], // Start from off-screen left, end off-screen right
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.logoPlaceholder, { opacity: logoFade }]}>
            <CustomText style={styles.logoText}>M</CustomText>
        </Animated.View>
        <Animated.Text style={[styles.title, { fontFamily: 'Poppins' }, { opacity: titleFade }]}>MechaFix</Animated.Text>
        <Animated.Text style={[styles.tagline, { fontFamily: 'Poppins' }, { opacity: taglineFade }]}>CAR SERVICES MADE SMART</Animated.Text>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  tagline: {
    fontSize: 23,
    color: '#666',
    letterSpacing: 2,
    marginTop: 8,
  },
  infoSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 19,
    color: '#555',
  },
  infoTextBold: {
    fontSize: 19,
    color: '#333',
    fontWeight: 'bold',
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
    backgroundColor: '#EAEAEA',
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
    backgroundColor: '#D9534F',
    borderRadius: 5,
  },
  carRoof: {
    position: 'absolute',
    top: 0,
    left: 15,
    width: 50,
    height: 20,
    backgroundColor: '#C9433F',
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
