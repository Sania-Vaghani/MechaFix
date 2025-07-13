import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import CustomText from '../../Components/CustomText';

const { width } = Dimensions.get('window');

const authScreens = [
  {
    key: '1',
    title: 'Smart Car Care Solutions',
    subtitle: '250+ Services across 12 categories',
    image: require('../images/img2.png'),
  },
  {
    key: '2',
    title: 'Car Service At Your Fingertips!',
    subtitle: 'Superfast 60-Seconds Booking',
    image: require('../images/img1.png'),
  },
  {
    key: '3',
    title: 'Live Updates & Expert Guidance',
    subtitle: 'Dedicated Certified Service mechanics',
    image: require('../images/img3.png'),
  },
];

const Pagination = ({ data, scrollX }) => {
    return (
        <View style={styles.paginationContainer}>
            {data.map((_, idx) => {
                const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });
                return <Animated.View key={idx.toString()} style={[styles.dot, { width: dotWidth, opacity }]} />;
            })}
        </View>
    );
};


const AuthScreen = () => {
  const [phone, setPhone] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.illustration} resizeMode="contain" />
      <CustomText style={styles.slideTitle}>{item.title}</CustomText>
      <CustomText style={styles.slideSubtitle}>{item.subtitle}</CustomText>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableOpacity style={styles.skipButton}>
        <CustomText style={styles.skipText}>Skip &gt;</CustomText>
      </TouchableOpacity>
      
      <View style={styles.carouselContainer}>
        <FlatList
          key={'auth-carousel'}
          data={authScreens}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />
        <Pagination data={authScreens} scrollX={scrollX} />
      </View>

      <View style={styles.formContainer}>
        <CustomText style={styles.loginViaText}>Login Via</CustomText>
        <View style={styles.phoneInputContainer}>
          <CustomText style={styles.countryCode}>🇮🇳 +91</CustomText>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter your mobile number"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <TouchableOpacity style={styles.primaryButton}>
          <CustomText style={styles.primaryButtonText}>Get OTP</CustomText>
        </TouchableOpacity>
        
        <View style={styles.separator}>
          <View style={styles.line} />
          <CustomText style={styles.orText}>OR</CustomText>
          <View style={styles.line} />
        </View>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Image source={require('../images/google.png') } style={styles.googleLogo} />
          <CustomText style={styles.secondaryButtonText}>Sign in with Google</CustomText>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
            <CustomText style={styles.signupText}>Don't have an account? </CustomText>
            <TouchableOpacity>
                <CustomText style={styles.signupLink}>Sign Up</CustomText>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
    },
    skipButton: {
      position: 'absolute',
      top: (StatusBar.currentHeight || 40) + 10,
      right: 20,
      zIndex: 1,
    },
    skipText: {
      fontSize: 16,
      color: '#757575',
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    carouselContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    slide: {
      width: width,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    illustration: {
      width: width * 0.85,
      height: '60%',
      marginTop: 50,
    },
    slideTitle: {
      fontSize: 35,
      color: '#212121',
      textAlign: 'center',
      paddingHorizontal: 20,
      fontFamily: 'Cormorant-Bold',
    },
    slideSubtitle: {
      fontSize: 16,
      color: '#616161',
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 20,
      fontFamily: 'Poppins',
    },
    paginationContainer: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
    },
    dot: {
      height: 5,
      borderRadius: 5,
      backgroundColor: '#E53935',
      marginHorizontal: 6,
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: 30,
      justifyContent: 'center',
      marginTop: -80,
    },
    loginViaText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#E53935',
      textAlign: 'center',
      marginBottom: 10,
      fontFamily: 'Poppins-Regular',
    },
    phoneInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
    },
    countryCode: {
      fontSize: 16,
      marginRight: 10,
      color: '#212121',
      fontFamily: 'Poppins',
    },
    phoneInput: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: '#212121',
      fontFamily: 'Poppins',
    },
    primaryButton: {
      backgroundColor: '#E53935',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'Poppins',
    },
    separator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    orText: {
      marginHorizontal: 10,
      color: '#757575',
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    secondaryButton: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    googleLogo: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    secondaryButtonText: {
      color: '#424242',
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Poppins',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signupText: {
        fontSize: 14,
        color: '#757575',
        fontFamily: 'Poppins',
    },
    signupLink: {
        fontSize: 14,
        color: '#E53935',
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
});


export default AuthScreen;
