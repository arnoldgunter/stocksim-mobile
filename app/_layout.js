import { Slot } from 'expo-router';
import { AuthProvider, useAuth } from "../lib/AuthContext";

export default function RootLayout() {

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
