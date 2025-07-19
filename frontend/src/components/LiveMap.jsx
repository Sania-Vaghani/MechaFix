import React, { useState, useCallback } from 'react';
import { View, PermissionsAndroid, Platform, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';

const LiveMap = () => {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const requestLocationPermissionAndFetch = async () => {
        let hasPermission = false;

        if (Platform.OS === 'android') {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              hasPermission = true;
            } else {
              if (isActive) setErrorMsg('Location permission denied');
              return;
            }
          } catch (err) {
            if (isActive) setErrorMsg('Permission error: ' + err.message);
            return;
          }
        } else {
          hasPermission = true;
        }

        if (hasPermission) {
          Geolocation.getCurrentPosition(
            position => {
              if (isActive) {
                setRegion({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }
            },
            error => {
              if (isActive) setErrorMsg(error.message);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        }
      };

      requestLocationPermissionAndFetch();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (errorMsg) {
    return (
      <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }
  if (!region) {
    return (
      <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ width: '100%', height: 160, borderRadius: 12 }}
      region={region}
      showsUserLocation={true}
    >
      <Marker coordinate={region} title="You are here" />
    </MapView>
  );
};

export default LiveMap;
