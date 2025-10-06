import { Ionicons } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../../lib/AuthContext';

export default function TeacherLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#111315' },
      tabBarActiveTintColor: '#E6F4FE',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: { textAlign: 'center' },
    }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add-student"
        options={{
          tabBarLabel: 'Add Student',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
