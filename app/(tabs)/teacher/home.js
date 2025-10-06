import { View, Text, Button, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, useWindowDimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import StudentDetail from '../../../components/studentDetail';

export default function Home() {
  const router = useRouter();

  const { width: windowWidth } = useWindowDimensions();

  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageType, setMessageType] = useState('');

  if (messageVisible) {
    setTimeout(() => {
      setMessageVisible(false);
    }, 3000);
  }

  const [searchTerm, setSearchTerm] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const studentsRes = await fetch("http://192.168.1.107:5001/api/teacher/students", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!studentsRes.ok) {
        setMessageType('error');
        setMessage("Portfolio fetch failed! status: " + studentsRes.status);
        setMessageVisible(true);
        throw new Error(`Portfolio fetch failed! status: ${studentsRes.status}`);
      }
      const studentJson = await studentsRes.json();
      setStudents(studentJson);

    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
      setMessageVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStudentPress = (studentId) => {
    setSelectedStudent(studentId);
    setModalVisible(true);
  };

  const currentStudent = selectedStudent
    ? students.find(student => student.student_id === selectedStudent)
    : null;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]} edges={['top']}>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingInline: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
      >
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
          <Text style={styles.title}>Students Overview</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search student by username..."
          placeholderTextColor={'#B1B3B4'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {
        students.length === 0 && (
          <View style={[styles.messageContainer, { backgroundColor: '#8EC57C', padding: 10 }]}>
            <Text style={styles.messageText}>No students found. Go to the add student tab and then come back and refresh the page.</Text>
          </View>
        )}
          {students
            .filter((student) => student.student_username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((student) => (
              <TouchableOpacity key={student.student_id} onPress={() => handleStudentPress(student.student_id)}>
                <View style={styles.studentContainer}>
                  <Ionicons name="person" size={24} color="white" />
                  <Text style={styles.studentName}>{student.student_username}</Text>
                </View>
              </TouchableOpacity>
            ))
        }

      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="slide" presentationStyle="fullScreen">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <LinearGradient
            colors={["#254912", "#111315"]}
            style={[styles.container, { width: windowWidth }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0, 0.25, 1]}
          >
            <View style={styles.header}>
              <Ionicons name="arrow-back-sharp" size={30} color="white" onPress={() => setModalVisible(false)} style={styles.backIcon} />
            </View>
            {currentStudent && (
              <StudentDetail
                key={currentStudent.student_id}
                username={currentStudent.student_username}
                password={currentStudent.student_password}
                funds={currentStudent.student_funds}
                id={currentStudent.student_id}
              />
            )}
          </LinearGradient>
        </ScrollView>

      </Modal>
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
  backIcon: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderColor: '#B1B3B4',
    borderWidth: 1,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  searchInput: {
    width: '100%',
    height: 50,
    borderColor: '#B1B3B4',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    color: 'white',
  },

  studentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#B1B3B4',
    borderRadius: 10,
    marginBottom: 10,
  },

  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  logoutButton: {
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

  logoutText: {
    color: 'white',
    fontSize: 16
  }
});
