import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [authRole, setRole] = useState(null);

  // === LOGIN ===
  const login = async (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
    await SecureStore.setItemAsync("token", newToken);
    await SecureStore.setItemAsync("role", newRole);
  };

  // === LOGOUT ===
  const logout = async () => {
    console.log("Token expired or user logged out — clearing SecureStore.");
    setToken(null);
    setRole(null);
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("role");
    router.replace("/");
  };

  // === Prüft, ob Token abgelaufen ist ===
  const checkTokenExpiry = async () => {
    const tokenFromStorage = await SecureStore.getItemAsync("token");
    if (!tokenFromStorage) return;

    try {
      const decoded = jwtDecode(tokenFromStorage);
      const currentTime = Date.now() / 1000;
      const timeRemaining = decoded.exp - currentTime;

      if (timeRemaining <= 0) {
        console.log("JWT expired. Logging out user.");
        await logout();
      } else if (timeRemaining < 60 * 60) {
        // optional: warnen oder erneuern, falls nur 1h übrig
        console.log("Token läuft bald ab (<1h).");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      await logout();
    }
  };

  // === Wiederherstellen von SecureStore beim Start ===
  const restoreAuth = async () => {
    const tokenFromStorage = await SecureStore.getItemAsync("token");
    const roleFromStorage = await SecureStore.getItemAsync("role");

    if (tokenFromStorage && roleFromStorage) {
      try {
        const decoded = jwtDecode(tokenFromStorage);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.log("Stored token expired — clearing.");
          await logout();
          return;
        }

        setToken(tokenFromStorage);
        setRole(roleFromStorage);
      } catch (err) {
        console.error("Invalid token in SecureStore:", err);
        await logout();
      }
    }
  };

  // === Lifecycle Hooks ===
  useEffect(() => {
    restoreAuth();
  }, []);

  // Überwache Token-Ablauf alle 5 Minuten
  useEffect(() => {
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ token, authRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// === Custom Hook ===
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
