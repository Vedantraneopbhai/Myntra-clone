import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, ScrollView, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setisloading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email.trim()) { Alert.alert("Validation Error", "Please enter your email"); return; }
      if (!password) { Alert.alert("Validation Error", "Please enter your password"); return; }
      if (!/\S+@\S+\.\S+/.test(email)) { Alert.alert("Validation Error", "Please enter a valid email"); return; }
      setisloading(true);
      console.log(`🔐 Starting login for ${email}`);
      await login(email, password);
      console.log(`✅ Login successful, navigating to home`);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      const errorMsg = error?.message || error?.error?.message || "Login failed";
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setisloading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerSection}>
        <View style={styles.cartImagePlaceholder}>
          <Text style={styles.placeholderText}>🛍️</Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to Myntra</Text>
        <Text style={styles.subtitle}>Login to continue shopping</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={theme.textPlaceholder}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={theme.textPlaceholder}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} color={theme.textMuted} /> : <Eye size={20} color={theme.textMuted} />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isloading}>
          {isloading ? <ActivityIndicator color={theme.primaryForeground} /> : <Text style={styles.buttonText}>LOGIN</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupLink} onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.loginHeaderBg },
  contentContainer: { flexGrow: 1 },
  headerSection: {
    height: 280, backgroundColor: theme.loginHeaderBg, position: "relative",
    justifyContent: "center", alignItems: "center", paddingTop: 40, overflow: "hidden",
  },
  cartImagePlaceholder: {
    width: 200, height: 200, backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 100, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.3)",
  },
  placeholderText: { fontSize: 80 },
  formContainer: {
    flex: 1, backgroundColor: theme.surface, borderTopLeftRadius: 40,
    borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 30,
  },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 8, color: theme.text },
  subtitle: { fontSize: 16, color: theme.textMuted, marginBottom: 35, fontWeight: "400" },
  input: {
    backgroundColor: theme.inputBackground, padding: 16, borderRadius: 12,
    marginBottom: 16, fontSize: 16, color: theme.text, fontWeight: "500",
  },
  passwordContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: theme.inputBackground,
    borderRadius: 12, marginBottom: 24, paddingRight: 8,
  },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: theme.text, fontWeight: "500" },
  eyeIcon: { padding: 8 },
  button: {
    backgroundColor: theme.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 8, shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  buttonText: { color: theme.primaryForeground, fontSize: 18, fontWeight: "bold", letterSpacing: 0.5 },
  signupLink: { marginTop: 24, alignItems: "center", paddingVertical: 12 },
  signupText: { color: theme.primary, fontSize: 16, fontWeight: "600" },
});
