import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import arrowIcon from '../images/arrow.png';
import callIcon from '../images/phone.png';
import videoIcon from '../images/customer-service.png';
import { useNavigation } from '@react-navigation/native';

const mechanic = {
  name: "MECHAFIX BOT",
  avatar: null, // Use a colored circle with initials if no image
  status: 'Online',
};

const defaultQuestions = [
  'Car won\'t start',
  'Flat tire',
  'Battery issue',
  'Engine overheating',
  'Strange noise',
  'Other...'
];

const initialMessages = [
  {
    from: 'mechanic',
    text: "Hi! I'm MechaBot, your virtual assistant. How can I help you today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const Messages = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async(text) => {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { from: 'user', text, time }]);
    setInput('');
    setChatStarted(true);

     try {
    const res = await fetch('http://10.0.2.2:8000/chatbot/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    const botReply = {
      from: 'mechanic',
      text: data.reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, botReply]);
  } catch (err) {
    console.error(err);
    setMessages(prev => [...prev, {
      from: 'mechanic',
      text: 'Sorry! Something went wrong.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }

    // Simulate mechanic reply
    // setTimeout(() => {
    //   setMessages(prev => [...prev, { from: 'mechanic', text: 'Thank you for your message. I\'m on it!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    // }, 1200);
  };

  const handleDefaultQuestion = (q) => {
    sendMessage(q);
    setChatStarted(true);
  };

  return (
    <LinearGradient colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]} style={styles.gradient}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Home')}>
          <Image source={arrowIcon} style={styles.arrowIcon} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {mechanic.avatar ? (
            <Image source={mechanic.avatar} style={styles.avatar} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(mechanic.name)}</Text>
            </View>
          )}
          <View>
            <Text style={styles.mechanicName}>{mechanic.name}</Text>
            {/* Removed online status */}
          </View>
        </View>
        {/* Removed call and video icons */}
      </View>
      {/* Chat Area */}
      <View style={styles.chatArea}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => {
            // Helper: check for triggers in bot response
            const isBot = msg.from === 'mechanic';
            const lowerText = msg.text.toLowerCase();
            const showSOS = isBot && (lowerText.includes('sos') || lowerText.includes('emergency'));
            const showBreakdown = isBot && (lowerText.includes('breakdown') || lowerText.includes('mechanic'));
            return (
              <View
                key={idx}
                style={[
                  styles.bubbleRow,
                  msg.from === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    msg.from === 'user' ? styles.userBubble : styles.mechanicBubble,
                  ]}
                >
                  <Text style={[
                    styles.bubbleText,
                    msg.from === 'user' ? styles.userBubbleText : styles.mechanicBubbleText,
                  ]}>{msg.text}</Text>
                  <Text style={[
                    styles.bubbleTime,
                    msg.from === 'user' ? styles.userBubbleTime : styles.mechanicBubbleTime
                  ]}>{msg.time}</Text>
                  {/* Add navigation buttons for certain bot responses */}
                  {showBreakdown && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { padding: 0, backgroundColor: 'transparent', marginTop: 8 }]}
                      onPress={() => navigation.navigate('Breakdown')}
                    >
                      <LinearGradient colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]} style={styles.gradientBtn}>
                        <Text style={styles.actionBtnText}>Go to Breakdown Page</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                  {showSOS && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { padding: 0, backgroundColor: 'transparent', marginTop: 8 }]}
                      onPress={() => navigation.navigate('SOS')}
                    >
                      <LinearGradient colors={["#f7cac9", "#f3e7e9", "#a1c4fd"]} style={styles.gradientBtn}>
                        <Text style={styles.actionBtnText}>Go to SOS Page</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      {/* Default Questions at Bottom */}
      {!chatStarted && (
        <View style={styles.issueOptionsFloating}>
          <Text style={styles.issuePrompt}>Select an issue to start:</Text>
          <View style={styles.issueChipsGrid}>
            {defaultQuestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.issueChip}
                activeOpacity={0.7}
                onPress={() => handleDefaultQuestion(q)}
              >
                <Text style={styles.issueChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={styles.inputBarWrapper}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(input)}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F6',
    elevation: 2,
    zIndex: 10,
  },
  headerIcon: {
    padding: 8,
    marginRight: 2,
  },
  arrowIcon: {
    width: 22,
    height: 22,
    tintColor: '#22223B',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 10,
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mechanicName: {
    fontSize: 22,
    marginLeft:-5,
    marginTop:10,
    color: '#22223B',
    fontFamily: 'Cormorant-Bold',
  },
  mechanicStatus: {
    fontSize: 13,
    color: '#22C55E',
    fontFamily: 'Poppins-Medium',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 28,
    height: 28,
    tintColor: '#22C55E',
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  defaultQuestionsContainer: {
    padding: 18,
    paddingTop: 32,
    alignItems: 'center',
  },
  defaultQuestionsTitle: {
    fontSize: 16,
    color: '#22223B',
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  defaultQuestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  questionChip: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  questionChipText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#ff5c5c',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    marginBottom: 2,
  },
  userBubbleTime: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'right',
  },
  mechanicBubble: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  mechanicBubbleText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    marginBottom: 2,
  },
  mechanicBubbleTime: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    opacity: 0.7,
    marginTop: 2,
    textAlign: 'right',
  },
  bubbleText: {
    marginBottom: 4,
  },
  bubbleTime: {
    fontSize: 11,
    color: '#B0B0B0',
    alignSelf: 'flex-end',
    fontFamily: 'Poppins-Regular',
  },
  inputBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    margin: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#22223B',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#FF4D4F',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
  defaultQuestionsContainerBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // just above the input bar
    backgroundColor: 'transparent',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
    // Optional: soft gradient background
    // You can use a LinearGradient if you want more polish
  },
  defaultQuestionsTitleBottom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22223B',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.2,
  },
  defaultQuestionsListBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    rowGap: 14,
  },
  questionChipBottom: {
    backgroundColor: '#f0f4ff',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginHorizontal: 6,
    marginVertical: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  questionChipTextBottom: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.1,
  },
  bottomDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56,
    height: 4,
    backgroundColor: '#e0e7ef',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 21,
    opacity: 0.7,
  },
  issueOptionsFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 70, // just above the input bar
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    zIndex: 20,
  },
  issuePrompt: {
    fontSize: 15,
    fontWeight: '500',
    color: '#22223B',
    marginLeft: 18,
    marginBottom: 10,
    opacity: 0.85,
    fontFamily: 'Poppins-Medium',
  },
  issueChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 8,
    gap: 12,
  },
  issueChip: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e7ef',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  issueChipText: {
    color: '#2563EB',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.1,
  },
  issueChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    rowGap: 14,
    width: '100%',
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 24, // extra space for touch input
  },
  actionBtn: {
    marginTop: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  gradientBtn: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
});

export default Messages;