import { View, Text, StyleSheet, ScrollView,  TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/AuthContext';
import { useState } from 'react';

export default function AddStudent() {

  const { token } = useAuth();

  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [funds, setFunds] = useState(0);

  if (messageVisible) {
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  }

  const handleAddStudent = async () => {
    try {
      const response = await fetch(`http://192.168.1.107:5001/api/teacher/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password, funds }),
      });

      if (!response.ok) {
        setMessageType('error');
        setMessage("Student add failed! status: " + response.status);
        setMessageVisible(true);
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Student add failed! status: " + error.message);
      setMessageVisible(true);
    } finally {
      setMessageType('success');
      setMessage("Student added successfully!");
      setMessageVisible(true);
      setUsername('');
      setPassword('');
      setFunds(0);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingInline: 10 }}>

        {messageVisible && messageType === 'error' ? (
          <View style={[styles.messageContainer, { backgroundColor: '#FF6B6B' }]}>
            <Ionicons name="close-circle" size={30} color="red" />
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : messageVisible && messageType === 'success' ? (
          <View style={[styles.messageContainer, { backgroundColor: '#8EC57C' }]}>
            <Ionicons name="checkmark-circle" size={30} color="green" />
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.title}>Add a student</Text>
        </View>

        <TextInput
          style={styles.userInput}
          placeholder="Username"
          placeholderTextColor={'#B1B3B4'}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.userInput}
          placeholder="Password"
          placeholderTextColor={'#B1B3B4'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.userInput}
          placeholder="Startup funds"
          placeholderTextColor={'#B1B3B4'}
          keyboardType="numeric"
          inputMode='decimal'
          value={funds}
          onChangeText={setFunds}
        />

        <View style={styles.divider} />

        <Text style={styles.text}>Username: {username}</Text>
        <Text style={styles.text}>Password: {password}</Text>
        <Text style={styles.text}>Startup funds: ${funds}</Text>
        

      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
        <Ionicons name="person-add" size={24} color="white" />
        <Text style={styles.addText}>Add Student</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111315',
  },

  messageContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBlock: 5,
    marginBottom: 20,
    borderRadius: 10,
  },

  messageText: {
    fontSize: 14,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  userInput: {
    width: '100%',
    height: 50,
    borderColor: '#B1B3B4',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 10,
    color: 'white',
  },

  text: {
    color: 'white',
    fontSize: 16,
    marginTop: 10
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#B1B3B4',
    marginTop: 30,
    marginBottom: 20
  },

  addButton: {
    marginInline: 'auto',
    maxWidth: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5C48DF',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 30
  },

  addText: {
    color: 'white',
    fontSize: 16
  }
});
