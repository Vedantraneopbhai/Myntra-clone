import React, { useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet, TextInput } from "react-native";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

export default function TestAPI() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      console.log("📝 Testing Signup...");
      console.log(`API_BASE_URL: ${API_BASE_URL}`);
      console.log(`Endpoint: ${API_BASE_URL}/user/signup`);
      
      const res = await axios.post(`${API_BASE_URL}/user/signup`, {
        fullName: "Test User",
        email,
        password,
      });
      
      console.log("✅ Signup Response:", res.data);
      setResponse(res.data);
    } catch (err: any) {
      console.error("❌ Signup Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      console.log("🔐 Testing Login...");
      console.log(`API_BASE_URL: ${API_BASE_URL}`);
      console.log(`Endpoint: ${API_BASE_URL}/user/login`);
      
      const res = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password,
      });
      
      console.log("✅ Login Response:", res.data);
      setResponse(res.data);
    } catch (err: any) {
      console.error("❌ Login Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      console.log("🏥 Testing Health...");
      console.log(`Endpoint: ${API_BASE_URL}/health`);
      
      const res = await axios.get(`${API_BASE_URL}/health`);
      
      console.log("✅ Health Response:", res.data);
      setResponse(res.data);
    } catch (err: any) {
      console.error("❌ Health Error:", err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🧪 API Test Page</Text>
        <Text style={styles.subtitle}>API Base URL: {API_BASE_URL}</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="test@example.com"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="password123"
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="🏥 Test Health" onPress={testHealth} disabled={loading} />
          <Button title="📝 Test Signup" onPress={testSignup} disabled={loading} />
          <Button title="🔐 Test Login" onPress={testLogin} disabled={loading} />
        </View>

        {loading && <Text style={styles.loading}>Loading...</Text>}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>❌ Error:</Text>
            <Text style={styles.errorText}>{JSON.stringify(error, null, 2)}</Text>
          </View>
        )}

        {response && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>✅ Response:</Text>
            <Text style={styles.successText}>{JSON.stringify(response, null, 2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
  },
  buttonContainer: {
    marginVertical: 15,
    gap: 10,
  },
  loading: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 10,
  },
  errorBox: {
    backgroundColor: "#ffebee",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ff0000",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c62828",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#b71c1c",
    fontFamily: "monospace",
  },
  successBox: {
    backgroundColor: "#e8f5e9",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00cc00",
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 5,
  },
  successText: {
    fontSize: 12,
    color: "#1b5e20",
    fontFamily: "monospace",
  },
});
