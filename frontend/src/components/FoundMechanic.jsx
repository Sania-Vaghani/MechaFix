import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import arrowIcon from '../images/arrow.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const FoundMechanic = ({ route, navigation }) => {
  const { lat, lon, breakdown_type, isFallback, preFetchedMechanics,carDetails  } = route.params;
  
  // Add this logging
  console.log('FoundMechanic received params:', { lat, lon, breakdown_type });

  const [mechanics, setMechanics] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  const loadUser = async () => {
    try {
      // Always fetch fresh user data from the server to ensure it's up-to-date
      const token = await AsyncStorage.getItem("jwtToken");
      const userType = await AsyncStorage.getItem("userType");

      if (token && userType === "user") {
        const res = await fetch("http://10.0.2.2:8000/api/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Update the cache with the fresh data
          await AsyncStorage.setItem("user", JSON.stringify(data));
          return data; // Return the fresh data
        } else {
          // If fetching fails, fall back to cached data as a last resort
          console.log("Failed to fetch user data, trying cache...");
          const storedUser = await AsyncStorage.getItem("user");
          return storedUser ? JSON.parse(storedUser) : null;
        }
      }
    } catch (error) {
      console.error("Error in loadUser:", error);
    }
    // If all else fails, return null
    return null;
  };
  

  const fetchMechanics = async () => {
    if (loading || allLoaded) return;
    setLoading(true);

    try {
      const response = await fetch('http://10.0.2.2:8000/api/recommendations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          breakdown_type,
          offset,
          limit: 5,
        }),
      });
      
      const text = await response.text();
      console.log('Fetch response:', response.status, text);

      if (!response.ok) {
        console.error('Server error:', response.status, text);
        Alert.alert("Error", `Server error: ${response.status}\n${text}`);
        setLoading(false);
        return;
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        Alert.alert("Error", "Invalid server response.");
        setLoading(false);
        return;
      }

      console.log('Fetched mechanics:', result);
      if (result.status === 'success') {
        const newMechs = result.mechanics;
        if (newMechs.length < 5) setAllLoaded(true);
        setMechanics(prev => [...prev, ...newMechs]);
        setOffset(prev => prev + 5);
      } else {
        Alert.alert("Error", result.message || "No mechanics found.");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert("Error", "Failed to fetch mechanics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendRequestToMechanic = async (mech) => {
    try {
      const user = await loadUser();
      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }
  
      const payload = {
        lat,
        lon,
        breakdown_type,
        user_id: user._id,
        user_name: user.username,
        user_phone: user.phone,
        car_model: carDetails?.car_model || null,
        year: carDetails?.year || null,
        license_plate: carDetails?.license_plate || null,
        description: carDetails?.description || null,
        issue_type: carDetails?.issue_type || null,
        image_url: carDetails?.image_url || null,
        mechanics_list: [
          {
            mech_id: mech._id,
            mech_name: mech.mech_name,
            road_distance_km: mech.road_distance_km ? parseFloat(mech.road_distance_km).toFixed(2) : null,
            rating: mech.rating,
            comment: mech.comment,
            status: "pending"
          }
        ]
      };
  
      const res = await axios.post("http://10.0.2.2:8000/api/service-request/", payload);
      console.log("✅ Sent request:", res.data);
  
      Alert.alert("Request Sent", `Your request to ${mech.mech_name} is now pending until mechanic responds.`);
    } catch (err) {
      console.error("❌ Error sending request:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to send request");
    }
  };
  

  useEffect(() => {
    // If we have pre-fetched mechanics, use them
    if (preFetchedMechanics && preFetchedMechanics.length > 0) {
      console.log('✅ Using pre-fetched mechanics from radar scan:', preFetchedMechanics);
      setMechanics(preFetchedMechanics);
      setOffset(preFetchedMechanics.length);
      if (preFetchedMechanics.length < 5) setAllLoaded(true);
    } else {
      fetchMechanics();
      setMechanics([]);
    }
  }, [preFetchedMechanics]);

  return (
    <LinearGradient colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]} style={styles.gradient}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()} style={styles.backArrow}>
          <Image source={arrowIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Found Mechanics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mechanics.length > 0 ? (
          <>
            {mechanics.map((mech, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.mechName}>{mech.mech_name}</Text>
                <Text style={styles.detail}>Rating: {mech.rating}</Text>
                <Text style={styles.detail}>Distance: {mech.road_distance_km?.toFixed(2)} km</Text>
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => sendRequestToMechanic(mech)}
                >
                  <Text style={styles.sendBtnText}>Send Request</Text>
                </TouchableOpacity>

              </View>
            ))}
            {!allLoaded && !loading &&(
              <TouchableOpacity style={styles.loadMoreBtn} onPress={fetchMechanics} activeOpacity={0.85}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            )}
            {loading && <ActivityIndicator color="#ff5c5c" style={{marginTop: 12}} />}
          </>
        ) : (
          <Text style={styles.noMechanics}>No mechanics found.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF4D4F',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
  },
  backArrow: { marginRight: 10, backgroundColor: '#fff', borderRadius: 16, padding: 4 },
  backArrowIcon: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#FF4D4F' },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cormorant-Bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: -20,
  },
  scrollContent: { alignItems: 'center', paddingBottom: 32, paddingTop: 18 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18, width: '90%',
    marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  mechName: { fontSize: 20, fontWeight: 'bold', color: '#22223B', marginBottom: 6 },
  detail: { fontSize: 16, color: '#444', marginBottom: 2 },
  sendBtn: {
    backgroundColor: '#ff5c5c', borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    marginTop: 10, shadowColor: '#ff5c5c', elevation: 2,
  },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noMechanics: { fontSize: 18, color: '#888', marginTop: 40 },
  loadMoreBtn: {
    backgroundColor: '#ff5c5c',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 18,
    minWidth: 160,
    alignSelf: 'center',
    shadowColor: '#ff5c5c',
    elevation: 2,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
});

export default FoundMechanic;
