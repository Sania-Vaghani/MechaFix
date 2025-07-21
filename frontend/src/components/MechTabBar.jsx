import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import homeIcon from '../images/home.png';
import availabilityIcon from '../images/loc.png';
import servicesIcon from '../images/engineer.png';
import profileIcon from '../images/user.png';
import requestsIcon from '../images/chat.png';

const icons = [
  { name: 'Home', icon: homeIcon },
  { name: 'Availability', icon: availabilityIcon },
  { name: 'Services', icon: servicesIcon },
  { name: 'Requests', icon: requestsIcon },
  { name: 'Profile', icon: profileIcon },
];

const ACCENT = '#FF4D4F';
const INACTIVE = '#B0B0B0';

const MechTabBar = ({ state, descriptors, navigation }) => {
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
            <Image
              source={iconObj.icon}
              style={[
                styles.icon,
                isFocused ? { tintColor: ACCENT } : { tintColor: INACTIVE },
              ]}
            />
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
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,1)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
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
    justifyContent: 'center',
    paddingVertical: 6,
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: INACTIVE,
    fontWeight: '500',
    marginTop: 0,
  },
});

export default MechTabBar;
