import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import homeIcon from '../images/home.png';
import chatIcon from '../images/chat.png';
import userIcon from '../images/user.png';
import sosIcon from '../images/sos.png';
import carIcon from '../images/car.png';

const icons = [
  { name: 'Home', icon: homeIcon },
  { name: 'Chatbot', icon: chatIcon },
  { name: 'SOS', icon: sosIcon },
  { name: 'Breakdown', icon: carIcon },
];

const ACCENT = '#FF4D4F';
const INACTIVE = '#B0B0B0';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const currentRoute = state.routes[state.index].name;
  if (currentRoute === 'Messages') {
    return null;
  }
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        // Special handling for Profile tab
        if (route.name === 'Profile') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapperContainer}>
                <View style={[
                  styles.iconWrapper,
                  isFocused ? styles.iconWrapperActive : styles.iconWrapperInactive,
                ]}>
                  <Image source={userIcon} style={[
                    isFocused ? styles.activeIcon : styles.inactiveIcon,
                    isFocused ? { tintColor: '#fff' } : { tintColor: INACTIVE },
                  ]} />
                </View>
              </View>
              <Text style={[styles.label, isFocused && { color: ACCENT, fontWeight: 'bold' }]}>{route.name}</Text>
            </TouchableOpacity>
          );
        }
        // Use chatIcon and label 'Chatbot' for Messages tab
        let iconObj = icons.find(i => i.name === route.name);
        let label = route.name;
        if (route.name === 'Messages') {
          iconObj = { icon: chatIcon };
          label = 'Chatbot';
        }
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
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
                  source={iconObj ? iconObj.icon : homeIcon}
                  style={[
                    styles.icon,
                    isFocused ? styles.activeIcon : styles.inactiveIcon,
                    isFocused ? { tintColor: '#fff' } : { tintColor: INACTIVE },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.label, isFocused && { color: ACCENT, fontWeight: 'bold' }]}>{label}</Text>
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
    width:63,
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
});

export default CustomTabBar; 