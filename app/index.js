import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions, ActivityIndicator
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from "../lib/AuthContext";


export default function Login() {
  const router = useRouter();
  const { login, token, authRole } = useAuth();

  useEffect(() => {
    if (token && authRole) {
      router.push(`/${authRole}/home`);
    }
  }, [token, authRole]);

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  // States für Inputs
  const [userNameStudent, setUserNameStudent] = useState("");
  const [passwordStudent, setPasswordStudent] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [userNameTeacher, setUserNameTeacher] = useState("");
  const [passwordTeacher, setPasswordTeacher] = useState("");

  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  const { width: windowWidth } = useWindowDimensions();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const payload =
        role === "student"
          ? {
            username: userNameStudent,
            password: passwordStudent,
            teacher_username: teacherName,
          }
          : {
            username: userNameTeacher,
            password: passwordTeacher,
          };

      const res = await fetch(`http://192.168.1.107:5001/api/auth/${role}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
        setShowMessage(true);
        setLoading(false);
        return;
      }

      login(data.token, data.role);

      router.push(`/${role}`);
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Server error, try again.");
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#8EC57C", "#111315"]}
      style={[styles.container, { width: windowWidth }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      locations={[0, 0.25, 1]}
    >
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.title}>Login to your Stocksim account</Text>


        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              role === "student" && { backgroundColor: "#5C48DF" },
            ]}
            onPress={() => setRole("student")}
          >
            <Text
              style={[styles.buttonText, role === "student" && { color: "white" }]}
            >
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.radioButton,
              role === "teacher" && { backgroundColor: "#5C48DF" },
            ]}
            onPress={() => setRole("teacher")}
          >
            <Text
              style={[styles.buttonText, role === "teacher" && { color: "white" }]}
            >
              Teacher
            </Text>
          </TouchableOpacity>
        </View>

        {role === "student" ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={"#B1B3B4"}
              autoCapitalize="none"
              autoCorrect={false}
              value={userNameStudent}
              onChangeText={setUserNameStudent}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={"#B1B3B4"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={passwordStudent}
              onChangeText={setPasswordStudent}
            />
            <TextInput
              style={styles.input}
              placeholder="Teacher Username"
              placeholderTextColor={"#B1B3B4"}
              autoCapitalize="none"
              autoCorrect={false}
              value={teacherName}
              onChangeText={setTeacherName}
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              placeholderTextColor={"#B1B3B4"}
              autoCapitalize="none"
              autoCorrect={false}
              value={userNameTeacher}
              onChangeText={setUserNameTeacher}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={"#B1B3B4"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={passwordTeacher}
              onChangeText={setPasswordTeacher}
            />
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>No account yet? Are you a teacher?</Text>
              <Link href="https://gluckauf-borse.onrender.com/register-teacher" style={styles.registerLink}>Register here!</Link>
            </View>
          </>
        )}

        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {showMessage && <Text style={styles.message}>{message}</Text>}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    maxWidth: 500,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: 24,
    marginVertical: "20%",
  },
  radioContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#B1B3B4",
    borderRadius: 50,
    padding: 3,
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: 50,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1C1E1F",
    borderColor: "#B1B3B4",
    color: "white",
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: "#5C48DF",
    height: 50,
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  message: {
    marginTop: 15,
    color: "red",
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 10,
    gap: 5,
  },
  registerText: {
    color: "#B1B3B4",
  },
  registerLink: {
    color: "#5C48DF",
  },
});
