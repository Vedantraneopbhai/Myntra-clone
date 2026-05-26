import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";
import axios from "axios";
import { useRouter } from "expo-router";
import { CreditCard, MapPin, Truck } from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, ActivityIndicator
} from "react-native";
import { API_BASE_URL } from "@/constants/api";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [bag, setBag] = useState<any[]>([]);
  const [loadingBag, setLoadingBag] = useState(true);
  
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const fetchBag = async () => {
      if (user) {
        try {
          setLoadingBag(true);
          const res = await axios.get(`${API_BASE_URL}/bag/${user._id}`);
          // Checkout only active items
          setBag(res.data?.filter((item: any) => !item.isSavedForLater) || []);
        } catch (error) {
          console.error("Error fetching checkout bag:", error);
        } finally {
          setLoadingBag(false);
        }
      }
    };
    fetchBag();
  }, [user]);

  // Dynamically calculate summary totals
  const subtotal = useMemo(() => {
    return bag.reduce((sum, item) => sum + (item.productId?.price ?? 0) * item.quantity, 0);
  }, [bag]);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99; // Free shipping above ₹999
  const tax = Math.round(subtotal * 0.05); // 5% GST tax
  const total = subtotal + shipping + tax;

  const handleplaceorder = async () => {
    if (!user) { router.push("/login"); return; }
    if (bag.length === 0) {
      Alert.alert("Checkout Blocked", "Your active bag is empty. Please add items before checking out.");
      return;
    }

    try {
      setLoading(true);
      // Corrected pre-existing API path bug: prepended '/Order' to '/create/:userId'
      await axios.post(`${API_BASE_URL}/Order/create/${user._id}`, {
        shippingAddress: "123 Main Street, Apt 4B, New York, NY, 10001",
        paymentMethod: "Card",
      });
      
      Alert.alert(
        "🎉 Success", 
        "Your order has been successfully placed!", 
        [{ text: "OK", onPress: () => router.push("/orders") }]
      );
    } catch (error: any) {
      console.log("Checkout Error:", error);
      Alert.alert("Checkout Failed", error.response?.data?.message || "Something went wrong placing the order.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingBag) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>
      <ScrollView style={styles.content}>
        {/* Shipping */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={theme.primary} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={theme.textPlaceholder} defaultValue="John Doe" />
            <TextInput style={styles.input} placeholder="Address Line 1" placeholderTextColor={theme.textPlaceholder} defaultValue="123 Main Street" />
            <TextInput style={styles.input} placeholder="Address Line 2" placeholderTextColor={theme.textPlaceholder} defaultValue="Apt 4B" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="City" placeholderTextColor={theme.textPlaceholder} defaultValue="New York" />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="State" placeholderTextColor={theme.textPlaceholder} defaultValue="NY" />
            </View>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Postal Code" placeholderTextColor={theme.textPlaceholder} defaultValue="10001" />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Country" placeholderTextColor={theme.textPlaceholder} defaultValue="United States" />
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={24} color={theme.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor={theme.textPlaceholder} defaultValue="**** **** **** 4242" />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Expiry Date" placeholderTextColor={theme.textPlaceholder} defaultValue="12/25" />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="CVV" placeholderTextColor={theme.textPlaceholder} defaultValue="***" />
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color={theme.primary} />
            <Text style={styles.sectionTitle}>Order Summary ({bag.length} items)</Text>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>{shipping === 0 ? "FREE" : `₹${shipping}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5% GST)</Text>
              <Text style={styles.summaryValue}>₹{tax}</Text>
            </View>
            <View style={[styles.summaryRow, styles.total]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handleplaceorder} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.primaryForeground} />
          ) : (
            <Text style={styles.placeOrderButtonText}>PLACE ORDER (₹{total})</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  header: { padding: 15, paddingTop: 50, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: theme.text },
  content: { flex: 1, padding: 15 },
  section: {
    marginBottom: 20, backgroundColor: theme.surface, borderRadius: 10, padding: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: theme.text, marginLeft: 10 },
  form: { gap: 10 },
  input: {
    backgroundColor: theme.inputBackground, padding: 15, borderRadius: 10,
    fontSize: 16, marginBottom: 10, color: theme.text,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  summary: { gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { fontSize: 16, color: theme.textMuted },
  summaryValue: { fontSize: 16, color: theme.textSecondary },
  total: { borderTopWidth: 1, borderTopColor: theme.border, marginTop: 10, paddingTop: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: theme.text },
  totalValue: { fontSize: 18, fontWeight: "bold", color: theme.primary },
  footer: { padding: 15, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  placeOrderButton: { backgroundColor: theme.primary, padding: 15, borderRadius: 10, alignItems: "center" },
  placeOrderButtonText: { color: theme.primaryForeground, fontSize: 16, fontWeight: "bold" },
});
