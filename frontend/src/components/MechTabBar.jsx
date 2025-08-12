import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import homeIcon from '../images/home.png';
import availabilityIcon from '../images/24-7.png';
import servicesIcon from '../images/engineer.png';
import profileIcon from '../images/user.png';
import requestsIcon from '../images/chat.png';

const icons = [
  { name: 'Home', icon: homeIcon },
  { name: 'Availability', icon: availabilityIcon },
  { name: 'Services', icon: servicesIcon },
  { name: 'Requests', icon: requestsIcon, badge: true },
  { name: 'Profile', icon: profileIcon },
];

const ACCENT = '#FF4D4F';
const INACTIVE = '#B0B0B0';

const MechTabBar = ({ state, descriptors, navigation }) => {
  // This will be updated when requests change
  const [requestCount, setRequestCount] = useState(6); // Initial count

  // Listen for navigation events to update count
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // You can implement a way to get the current count here
      // For now, we'll use a simple approach
    });

    return unsubscribe;
  }, [navigation]);

  // Function to update request count (can be called from Requests component)
  const updateRequestCount = (count) => {
    setRequestCount(count);
  };

  // Make this function available globally so Requests component can call it
  global.updateTabBarRequestCount = updateRequestCount;

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconObj = icons[index];
        const descriptor = descriptors[route.key];
        // Defensive: skip if descriptor or iconObj is missing
        if (!descriptor || !iconObj) return null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptor.options?.tabBarAccessibilityLabel}
            testID={descriptor.options?.tabBarTestID}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapperContainer}>
              <View style={[
                styles.iconWrapper,
                isFocused ? styles.iconWrapperActive : styles.iconWrapperInactive,
              ]}>
                <Image
                  source={iconObj.icon}
                  style={[
                    styles.icon,
                    isFocused ? styles.activeIcon : styles.inactiveIcon,
                    isFocused ? { tintColor: '#fff' } : { tintColor: INACTIVE },
                  ]}
                />
                {/* Request Count Badge */}
                {iconObj.badge && requestCount > 0 && (
                  <View style={[
                    styles.badge,
                    isFocused ? styles.badgeActive : styles.badgeInactive
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      isFocused ? styles.badgeTextActive : styles.badgeTextInactive
                    ]}>
                      {requestCount > 99 ? '99+' : requestCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.label, isFocused && { color: ACCENT, fontWeight: 'bold' }]}>{iconObj.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 0, // Attach to bottom
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 9,
    minWidth: 30,
    overflow: 'visible',
  },
  iconWrapperContainer: {
    width: 72,
    height: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapperActive: {
    backgroundColor: ACCENT,
    borderRadius: 32,
    width: 63,
    height: 63,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -40,
    left: 5,
    shadowColor: ACCENT,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  iconWrapperInactive: {
    backgroundColor: 'transparent',
    width: 35,
    height: 35,
    position: 'relative',
    top: 0,
    left: 0,
    marginLeft: 0,
  },
  icon: {
    width: 26,
    height: 26,
  },
  activeIcon: {
    width: 30,
    height: 30,
  },
  inactiveIcon: {
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 12,
    color: INACTIVE,
    fontWeight: '500',
    marginTop: 0,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: ACCENT,
  },
  badgeInactive: {
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  badgeTextActive: {
    color: ACCENT,
  },
  badgeTextInactive: {
    color: '#FFFFFF',
  },
});

export default MechTabBar;
