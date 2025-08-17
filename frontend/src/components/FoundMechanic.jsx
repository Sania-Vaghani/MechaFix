import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import arrowIcon from '../images/arrow.png';

const FoundMechanic = ({ route, navigation }) => {
  const { lat, lon, breakdown_type, isFallback, preFetchedMechanics } = route.params;
  
  // Add this logging
  console.log('FoundMechanic received params:', { lat, lon, breakdown_type });

  const [mechanics, setMechanics] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

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

  useEffect(() => {
    // If we have pre-fetched mechanics, use them
    if (preFetchedMechanics && preFetchedMechanics.length > 0) {
      console.log('✅ Using pre-fetched mechanics from radar scan:', preFetchedMechanics);
      setMechanics(preFetchedMechanics);
      setOffset(preFetchedMechanics.length);
      if (preFetchedMechanics.length < 5) setAllLoaded(true);
    } else {
      // Otherwise fetch mechanics normally
    fetchMechanics();
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
                  onPress={() => Alert.alert("Request Sent", `Request sent to ${mech.mech_name}`)}
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
