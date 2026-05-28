import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

export default function Signup() {
  const { Signup } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const router = useRouter();
  const [isloading, setisloading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { fullName: "", email: "", password: "" };
    if (!formData.fullName.trim()) { newErrors.fullName = "Full name is required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Please enter a valid email"; isValid = false; }
    if (!formData.password) { newErrors.password = "Password is required"; isValid = false; }
    else if (formData.password.length < 8) { newErrors.password = "Password must be at least 8 characters"; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      try {
        setisloading(true);
        console.log(`📝 Starting signup for ${formData.email}`);
        await Signup(formData.fullName, formData.email, formData.password);
        console.log(`✅ Signup successful, navigating to home`);
        router.replace("/(tabs)");
      } catch (error: any) {
        console.error("❌ Signup failed:", error);
        const errorMsg = error?.message || error?.error?.message || "Signup failed";
        Alert.alert("Signup Failed", errorMsg);
      } finally {
        setisloading(false);
      }
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Myntra and discover amazing fashion</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, errors.fullName ? styles.inputError : null]}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            placeholderTextColor={theme.textPlaceholder}
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.textPlaceholder}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.textPlaceholder}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color={theme.textMuted} /> : <Eye size={20} color={theme.textMuted} />}
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isloading}>
          {isloading ? <ActivityIndicator color={theme.primaryForeground} /> : <Text style={styles.buttonText}>SIGN UP</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/login")}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
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
  inputGroup: { marginBottom: 16 },
  input: {
    backgroundColor: theme.inputBackground, padding: 16, borderRadius: 12,
    fontSize: 16, color: theme.text, fontWeight: "500",
  },
  inputError: { borderWidth: 1, borderColor: theme.primary },
  errorText: { color: theme.primary, fontSize: 12, marginTop: 5, marginLeft: 5 },
  passwordContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: theme.inputBackground, borderRadius: 12, paddingRight: 8,
  },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: theme.text, fontWeight: "500" },
  eyeIcon: { padding: 8 },
  button: {
    backgroundColor: theme.primary, padding: 16, borderRadius: 12,
    alignItems: "center", marginTop: 8, shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  buttonText: { color: theme.primaryForeground, fontSize: 18, fontWeight: "bold", letterSpacing: 0.5 },
  loginLink: { marginTop: 24, alignItems: "center", paddingVertical: 12 },
  loginText: { color: theme.primary, fontSize: 16, fontWeight: "600" },
});
