import React from 'react';
import { View, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import microphoneIcon from '../images/microphone.png';
import searchIcon from '../images/search.png';

const SearchMechanicBar = ({ search, setSearch, onFocus, onBlur }) => (
  <View style={styles.searchBarContainer}>
    <Image source={searchIcon} style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search mechanic"
      placeholderTextColor="#6B7280"
      value={search}
      onChangeText={setSearch}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    <TouchableOpacity style={styles.microphoneBtn}>
      <Image source={microphoneIcon} style={styles.microphoneIcon} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
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
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
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
    color: '#22223B',
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
});

export default SearchMechanicBar;
