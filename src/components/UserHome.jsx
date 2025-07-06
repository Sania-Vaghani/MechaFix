import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import locIcon from '../images/loc.png';
import settingIcon from '../images/setting.png';
import user2Icon from '../images/user2.png';
import carIcon from '../images/car.png';
import chatIcon from '../images/chat.png';
import sosIcon from '../images/sos.png';
import padlockIcon from '../images/padlock.png';
import hiIcon from '../images/hi.png';

const serviceIcons = {
  breakdown: require('../images/img1.png'),
  fuel: require('../images/img2.png'),
  towing: require('../images/img3.png'),
  battery: require('../images/padlock.png'),
};

const HEADER_HEIGHT = 110;

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
  // Remove darkMode state and theme logic
  // const [darkMode, setDarkMode] = useState(false);
  // const theme = darkMode ? darkTheme : lightTheme;
  const theme = lightTheme;

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
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
              <Text style={[styles.greeting, { color: theme.text }]}>Hello, Saniya</Text>
              <Image source={hiIcon} style={{ width: 38, height: 38, marginLeft: 6, marginTop: 2 }} />
            </View>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Image source={settingIcon} style={styles.headerImgIcon} />
          </TouchableOpacity>
          {/* Removed dark mode Switch */}
        </View>
      </LinearGradient>
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingTop: HEADER_HEIGHT + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Location Card */}
        <View style={[styles.card, styles.gpsCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Image source={locIcon} style={styles.gpsIcon} />
            <Text style={styles.gpsTitle}>GPS Location</Text>
            <View style={styles.statusDot} />
            <Text style={styles.statusActive}>Active</Text>
          </View>
          <Text style={styles.gpsSubTitle}>Current Location: Detected</Text>
          <Text style={styles.gpsDesc}>Your location is being tracked for emergency assistance</Text>
        </View>

        {/* Emergency SOS & Contact Mechanic Cards */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
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

        {/* Quick Services Section */}
        <Text style={styles.sectionHeader}>Quick Services</Text>
        <View style={styles.quickServicesRow}>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardGreen]} onPress={onFastConnection}>
            <Text style={styles.quickTitle}>Fast Connection</Text>
            <Text style={styles.quickDesc}>Quick mechanic match</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, styles.quickCardBlue]} onPress={onLiveChat}>
            <Text style={styles.quickTitle}>Live Chat & Call</Text>
            <Text style={styles.quickDesc}>Real-time support</Text>
          </TouchableOpacity>
        </View>

        {/* Services Available Section */}
        <Text style={styles.sectionHeader}>Services Available</Text>
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
              <Image source={serviceIcons.battery} style={styles.serviceIconModern} />
            </View>
            <Text style={styles.serviceTitleModern}>Battery</Text>
            <Text style={styles.serviceDescModern}>Jump start</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity Section */}
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItemModern}>
            <View style={styles.dotActive} />
            <View>
              <Text style={styles.activityTitleModern}>Service Completed</Text>
              <Text style={styles.activityDescModern}>Battery replacement - 2 days ago</Text>
            </View>
          </View>
          <View style={styles.activityItemModern}>
            <View style={styles.dotBlue} />
            <View>
              <Text style={styles.activityTitleModern}>Mechanic Found</Text>
              <Text style={styles.activityDescModern}>Connected with John's Garage - 1 week ago</Text>
            </View>
          </View>
        </View>

        {/* Feedback Section */}
        <Text style={styles.sectionHeader}>How was your last service?</Text>
        <View style={styles.feedbackCard}>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(i => (
              <Text key={i} style={styles.star}>★</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Submit Feedback</Text>
          </TouchableOpacity>
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
    elevation: 4,
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
    borderRadius: 18,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
  },
  actionDesc: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  actionBtnText: {
    color: '#FF4D4F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionBtnOutline: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  actionBtnOutlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 10,
    marginTop: 18,
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
    borderRadius: 18,
    padding: 14,
    width: '47%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceIconModern: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  serviceTitleModern: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 1,
  },
  serviceDescModern: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 1,
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
});

export default UserHome; 