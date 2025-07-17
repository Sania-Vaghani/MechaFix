import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Modal, Pressable, Keyboard, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import locIcon from '../images/loc.png';
import settingIcon from '../images/setting.png';
import user2Icon from '../images/user2.png';
import carIcon from '../images/car.png';
import chatIcon from '../images/chat.png';
import sosIcon from '../images/sos.png';
import padlockIcon from '../images/padlock.png';
import hiIcon from '../images/hi.png';
import phoneIcon from '../images/phone.png';
import emergencyIcon from '../images/emergency-call.png';
import engineerIcon from '../images/engineer.png';
import serviceIcon from '../images/customer-service.png';
import accumulatorIcon from '../images/accumulator.png';
import microphoneIcon from '../images/microphone.png';
import boltIcon from '../images/bolt.png';
import messageIcon from '../images/message.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';

const serviceIcons = {
  breakdown: require('../images/img1.png'),
  fuel: require('../images/img2.png'),
  towing: require('../images/img3.png'),
  battery: accumulatorIcon,
};

const mechanicData = [
  { id: '1', name: 'John Doe', mobile: '9876543210' },
  { id: '2', name: 'Jane Smith', mobile: '9123456789' },
  { id: '3', name: 'Mike Johnson', mobile: '9988776655' },
  { id: '4', name: 'Emily Brown', mobile: '9001122334' },
];

const lastAllottedMechanics = [
  { id: '5', name: 'Rahul Mehta', mobile: '9876501234' },
  { id: '6', name: 'Priya Singh', mobile: '9123409876' },
  { id: '7', name: 'Amit Sharma', mobile: '9988771122' },
  { id: '8', name: 'Sneha Patel', mobile: '9001122445' },
  { id: '9', name: 'Vikram Rao', mobile: '9112233445' },
];

const HEADER_HEIGHT = 140; // Increased to fit search bar and results

const UserHome = ({
  onCallSOS,
  onContactMechanic,
  onFastConnection,
  onLiveChat,
  onBreakdown,
  onFuelDelivery,
  onTowing,
  onBattery,
}) => {
 
  const theme = lightTheme;

  // Search state
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  // Remove modal and selectedMechanic state
  const [searchFocused, setSearchFocused] = useState(false);
  // Change showResults logic to show dropdown and blur overlay on focus, even if search is empty
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add a ref and state to measure the search bar position
  const searchBarRef = useRef(null);
  const [searchBarY, setSearchBarY] = useState(0);
  const [searchBarHeight, setSearchBarHeight] = useState(0);

  // Add state to track dropdown height
  const [dropdownHeight, setDropdownHeight] = useState(0);

  // Filter mechanics
  const filteredMechanics = mechanicData.filter(
    m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.mobile.includes(search)
  );

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [noResultAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (dropdownOpen && filteredMechanics.length === 0 && search) {
      Animated.timing(noResultAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      noResultAnim.setValue(0);
    }
  }, [dropdownOpen, filteredMechanics.length, search]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      const userType = await AsyncStorage.getItem('userType');
      if (token && userType === 'user') {
        try {
          const res = await API.get('users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          console.log('Failed to fetch user profile', err);
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
      {/* Search Overlay for blur/black transparent effect */}
      {dropdownOpen && (
        <Pressable
          style={[
            styles.searchOverlay,
            { top: searchBarY + searchBarHeight + dropdownHeight + 8 }
          ]}
          onPress={() => {
            setDropdownOpen(false);
            setSearchFocused(false);
            Keyboard.dismiss();
          }}
        />
      )}
      {/* Mechanic Detail Modal */}
      {/* Remove Modal and related code */}
      {/* Fixed Header */}
      <LinearGradient
        colors={['#f7cac9', '#f3e7e9', '#a1c4fd']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <Image source={user2Icon} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.greeting, { color: theme.text }]}>
                {user ? `Hello, ${user.username}` : 'Hello!'}
              </Text>
              <Image source={hiIcon} style={{ width: 38, height: 38, marginLeft: 6, marginTop: 2 }} />
            </View>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <View
          style={styles.searchBarContainer}
          ref={searchBarRef}
          onLayout={event => {
            setSearchBarY(event.nativeEvent.layout.y);
            setSearchBarHeight(event.nativeEvent.layout.height);
          }}
        >
          <Image source={require('../images/search.png')} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mechanic"
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={text => {
              setSearch(text);
              setShowResults(text.length > 0);
            }}
            onFocus={() => {
              setDropdownOpen(true);
              setSearchFocused(true);
            }}
            onBlur={() => setTimeout(() => {
              setDropdownOpen(false);
              setSearchFocused(false);
            }, 200)}
            autoFocus={false}
          />
          <TouchableOpacity style={styles.microphoneBtn}>
            <Image source={microphoneIcon} style={styles.microphoneIcon} />
          </TouchableOpacity>
        </View>
        {/* Search Results (Vertical List) */}
        {dropdownOpen && (
          <View
            style={[styles.dropdownContainer, { top: searchBarY + searchBarHeight + 8, zIndex: 100 }]}
            onLayout={event => setDropdownHeight(event.nativeEvent.layout.height)}
          >
            {filteredMechanics.length > 0 || !search ? (
              <FlatList
                data={filteredMechanics.length > 0 || search ? filteredMechanics : mechanicData}
                keyExtractor={item => item.id}
                style={{ maxHeight: 220 }}
                renderItem={({ item, index }) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.dropdownRow,
                      highlightedIndex === index && styles.dropdownRowHighlight
                    ]}
                    onPressIn={() => setHighlightedIndex(index)}
                    onPressOut={() => setHighlightedIndex(-1)}
                    onHoverIn={() => setHighlightedIndex(index)}
                    onHoverOut={() => setHighlightedIndex(-1)}
                  >
                    <Image source={require('../images/user.png')} style={styles.dropdownIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{item.name}</Text>
                      <Text style={styles.dropdownMobile}>{item.mobile}</Text>
                    </View>
                    <TouchableOpacity style={styles.callIconBtn}>
                      <Image source={phoneIcon} style={styles.callIcon} />
                    </TouchableOpacity>
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Animated.View style={{ opacity: noResultAnim }}>
                <View style={styles.dropdownRow}>
                  <Text style={styles.noResultText}>No results found</Text>
                </View>
              </Animated.View>
            )}
          </View>
        )}
      </LinearGradient>
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: HEADER_HEIGHT + 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Location Section */}
        <View style={[styles.section, styles.gpsSection]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={locIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>GPS LOCATION</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={[styles.card, styles.gpsCard]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Image source={locIcon} style={styles.gpsIcon} />
              <Text style={styles.gpsTitle}>GPS Location</Text>
              <View style={styles.statusDot} />
              <Text style={styles.statusActive}>Active</Text>
              <View style={{ flex: 1 }} />
              {/* Car SVG */}
              <View style={styles.gpsCarSvgContainer}>
                <View style={styles.gpsCarBody} />
                <View style={styles.gpsCarRoof} />
                <View style={styles.gpsCarWheelContainer}>
                  <View style={styles.gpsCarWheel} />
                  <View style={styles.gpsCarWheel} />
                </View>
              </View>
            </View>
            <Text style={styles.gpsSubTitle}>Current Location: Detected</Text>
            <Text style={styles.gpsDesc}>Your location is being tracked for emergency assistance</Text>
            
            {/* Map Container */}
            <View style={styles.mapContainer}>
              <Text style={styles.mapPlaceholderText}>Map will be displayed here</Text>
            </View>
          </View>
        </View>

        {/* Emergency Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={emergencyIcon} style={[styles.sectionIcon,styles.emergencyStyle]} />
            <Text style={styles.sectionHeader}>EMERGENCY</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.emergencyContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 0 }}>
              <View style={[styles.actionCard, styles.sosCard]}>
                <Image source={sosIcon} style={styles.actionIcon} />
                <Text style={styles.actionTitle}>Emergency SOS</Text>
                <Text style={styles.actionDesc}>Immediate help for critical situations</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={onCallSOS}>
                  <Text style={styles.actionBtnText}>Call SOS</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.actionCard, styles.mechanicCard]}>
                <Image source={chatIcon} style={styles.actionIcon} />
                <Text style={styles.actionTitle}>Contact Mechanic</Text>
                <Text style={styles.actionDesc}>Connect with nearby mechanics</Text>
                <TouchableOpacity style={styles.actionBtnOutline} onPress={onContactMechanic}>
                  <Text style={styles.actionBtnOutlineText}>Find Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Mechanics Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={require('../images/history.png')} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>RECENT MECHANICS</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.recentMechContainer}>
            {lastAllottedMechanics.length > 0 ? (
              lastAllottedMechanics.map((mech, idx) => (
                <View key={mech.id}>
                  <View style={styles.recentMechRow}>
                    <Image source={require('../images/user.png')} style={styles.dropdownIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownName}>{mech.name}</Text>
                      <Text style={styles.dropdownMobile}>{mech.mobile}</Text>
                    </View>
                    <TouchableOpacity style={styles.callIconBtn}>
                      <Image source={phoneIcon} style={styles.callIcon} />
                    </TouchableOpacity>
                  </View>
                  {idx !== lastAllottedMechanics.length - 1 ? <View style={styles.recentMechDivider} /> : null}
                </View>
              ))
            ) : (
              <Text style={styles.dropdownMobile}>No mechanics allotted or called yet.</Text>
            )}
          </View>
        </View>

        {/* Quick Services Section */}
        <View style={[styles.section, styles.quickServicesSection]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={serviceIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>QUICK SERVICES</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.quickServicesRow}>
            <TouchableOpacity style={[styles.quickCard, styles.quickCardGreen]} onPress={onFastConnection}>
              <Image source={boltIcon} style={styles.quickServiceBoltIcon} />
              <Text style={styles.quickTitle}>Fast Connection</Text>
              <Text style={styles.quickDesc}>Quick mechanic match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickCard, styles.quickCardBlue]} onPress={onLiveChat}>
              <Image source={messageIcon} style={styles.quickServiceMessageIcon} />
              <Text style={styles.quickTitle}>Live Chat & Call</Text>
              <Text style={styles.quickDesc}>Real-time support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Available Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Image source={settingIcon} style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>SERVICES AVAILABLE</Text>
          </View>
          <View style={styles.sectionDivider} />
          <View style={styles.servicesGrid}>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onBreakdown}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#FFB347' }]}> 
                <Image source={serviceIcons.breakdown} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Breakdown</Text>
              <Text style={styles.serviceDescModern}>Car repair</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onFuelDelivery}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#4ADE80' }]}> 
                <Image source={serviceIcons.fuel} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Fuel Delivery</Text>
              <Text style={styles.serviceDescModern}>Emergency fuel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onTowing}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#60A5FA' }]}> 
                <Image source={serviceIcons.towing} style={styles.serviceIconModern} />
              </View>
              <Text style={styles.serviceTitleModern}>Towing</Text>
              <Text style={styles.serviceDescModern}>Vehicle towing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceCardModern} onPress={onBattery}>
              <View style={[styles.serviceIconCircle, { backgroundColor: '#F87171' }]}> 
                <Image source={serviceIcons.battery} style={[styles.serviceIconModern,styles.batteryIcon]} />
              </View>
              <Text style={styles.serviceTitleModern}>Battery</Text>
              <Text style={styles.serviceDescModern}>Jump start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const lightTheme = {
  text: '#22223B',
  textSecondary: '#6B7280',
};

const styles = StyleSheet.create({
  headerGradient: {
    borderRadius: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 0,
    padding: 18,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 4,
    borderColor:'#fff',
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Cormorant-Bold',
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop:-3,
  },
  headerIconBtn: {
    marginLeft: 8,
    padding: 7,
  },
  headerImgIcon: {
    width: 27,
    height: 27,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8, // Less rounded corners
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  cardSubText: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  mapPreview: {
    backgroundColor: '#e3e7ee',
    borderRadius: 12,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  vehicleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  vehicleDesc: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  vehicleStatus: {
    fontSize: 13,
    color: '#22C55E',
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
  },
  promoItem: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  promoText: {
    fontSize: 14,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  gpsIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  emergencyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  emergencyBtnText: {
    fontSize: 13,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
  },
  quickCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    margin: 4,
    minWidth: '45%',
    maxWidth: '48%',
    alignItems: 'flex-start',
    backgroundColor: '#f3f3f3',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  quickDesc: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    margin: 4,
    minWidth: '45%',
    maxWidth: '48%',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  serviceIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  dotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  activityDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    fontSize: 24,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  gpsCard: {
    backgroundColor: '#fff',
    borderRadius: 8, // Less rounded corners
    padding: 18,
    marginBottom: 18,
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  gpsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#22223B',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ecc40',
    marginLeft: 10,
    marginRight: 4,
  },
  statusActive: {
    color: '#2ecc40',
    fontWeight: 'bold',
    fontSize: 15,
  },
  gpsSubTitle: {
    fontSize: 15,
    color: '#22223B',
    marginTop: 6,
    marginBottom: 2,
  },
  gpsDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    marginRight: 8,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  sosCard: {
    backgroundColor: '#FF4D4F',
    marginRight: 8,
  },
  mechanicCard: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
  },
  actionIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    tintColor: '#fff',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center', // Center text
  },
  actionDesc: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center', // Center text
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 8,
    // 3D shadow
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, // Android
  },
  actionBtnText: {
    color: '#FF4D4F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionBtnOutline: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 8,
    // 3D shadow
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, // Android
  },
  actionBtnOutlineText: {
    color: '#3B82F6', // Blue text
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 18, // Reduced from 24
  },
  sectionHeader: {
    fontSize: 22,
    color: '#22223B',
    marginBottom: 10,
    fontFamily: 'Cormorant-Bold',
  },
  quickServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  quickCardGreen: {
    backgroundColor: '#eaffea',
    borderColor: '#2ecc40',
    borderWidth: 1,
  },
  quickCardBlue: {
    backgroundColor: '#f0f7ff',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  serviceCardModern: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    width: '47%',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#f3e7e9',
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f7fafc',
    shadowColor: '#a1c4fd',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceIconModern: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  batteryIcon:{
    width:31,
    height:31,
  },
  serviceTitleModern: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  serviceDescModern: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 1,
    fontFamily: 'Poppins-Regular',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitleModern: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22223B',
  },
  activityDescModern: {
    fontSize: 15,
    color: '#6B7280',
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 10,
    marginBottom: 16,
    marginTop: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15, // Increased for stronger shadow
    shadowRadius: 16,    // Increased for softer shadow
    shadowOffset: { width: 0, height: 4 }, // More natural shadow
    elevation: 8,        // Increased for Android
    borderWidth: 1.5,
    borderColor: '#E53935',
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#22223B',
  },
  resultsContainer: {
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  mechanicBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mechanicAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  mechanicName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  mechanicMobile: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 18,
    color: '#22223B',
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  searchOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 20,
    // top will be set dynamically
  },
  dropdownContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    // top is set dynamically
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 1000, // much higher for Android
    zIndex: 9999, // much higher for iOS/web
    paddingVertical: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
    resizeMode: 'contain',
    tintColor: '#B0B0B0', // Grey tint
  },
  dropdownName: {
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Bold',
  },
  dropdownMobile: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 54,
    marginRight: 0,
  },
  dropdownRowHighlight: {
    backgroundColor: '#f0f4ff', // or any highlight color you prefer
  },
  callIconBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    width: 24,
    height: 24,
    tintColor: '#E53935',
    resizeMode: 'contain',
  },
  noResultText: {
    color: '#E53935',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  recentMechContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: '100%',
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  recentMechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  recentMechDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 54,
    marginRight: 0,
  },
  mapContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    height: 120,
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    color: '#6c757d',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  emergencyContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    shadowColor: '#E53935', // Red shadow for blurred border effect
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    marginTop: 0,
    marginBottom: 0,
  },
  gpsCarSvgContainer: {
    width: 48,
    height: 28,
    marginLeft: 8,
    marginRight: 2,
    alignSelf: 'center',
  },
  gpsCarBody: {
    position: 'absolute',
    bottom: 6,
    width: 48,
    height: 14,
    backgroundColor: '#E53935',
    borderRadius: 3,
  },
  gpsCarRoof: {
    position: 'absolute',
    top: 0,
    left: 9,
    width: 30,
    height: 10,
    backgroundColor: '#92A5A6',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  gpsCarWheelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gpsCarWheel: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  quickServicesSection: {
    marginBottom: 4,
  },
  gpsSection: {
    marginBottom: 4,
  },
  sectionIcon: {
    width: 25,
    height: 25,
    marginRight: 8,
    marginBottom:8,
    resizeMode: 'contain',
  },
  emergencyStyle:{
    height : 21,
    width : 21,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
    marginTop:-13,
    marginHorizontal: 2,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOpacity:0.10,
    shadowRadius:3,
  },
  microphoneBtn: {
    marginLeft: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  quickServiceBoltIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#22C55E', // green
    alignSelf: 'flex-start',
  },
  quickServiceChatIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#3B82F6', // blue
    alignSelf: 'flex-start',
  },
  quickServiceMessageIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
    tintColor: '#3B82F6', // blue
    alignSelf: 'flex-start',
  },
});

export default UserHome; 