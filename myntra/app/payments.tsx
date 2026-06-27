import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CreditCard,
  Wallet,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  ChevronLeft,
} from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeColors } from "@/constants/Theme";
import { API_BASE_URL } from "@/constants/api";
import axios from "axios";

type PaymentMethod = {
  _id: string;
  type: string;
  name: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  upiId?: string;
  isDefault?: boolean;
  balance?: number;
};

export default function Payments() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: "credit",
    name: "",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    upiId: "",
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/payment/${user._id}`);
      setMethods(res.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      Alert.alert("Error", "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePayment = async () => {
    if (!user) return;

    if (!formData.name) {
      Alert.alert("Validation Error", "Please enter a name for this payment method");
      return;
    }

    if (formData.type === "credit" || formData.type === "debit") {
      if (!formData.cardNumber || !formData.cardHolderName || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
        Alert.alert("Validation Error", "Please fill all card details");
        return;
      }
    }

    if (formData.type === "upi" && !formData.upiId) {
      Alert.alert("Validation Error", "Please enter UPI ID");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await axios.put(`${API_BASE_URL}/payment/${editingId}`, {
          name: formData.name,
          isDefault: formData.isDefault,
        });
        Alert.alert("Success", "Payment method updated");
      } else {
        await axios.post(`${API_BASE_URL}/payment`, {
          userId: user._id,
          ...formData,
        });
        Alert.alert("Success", "Payment method added");
      }

      await fetchPaymentMethods();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      console.error("Error saving payment method:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save payment method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Payment Method", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/payment/${id}`);
            Alert.alert("Success", "Payment method deleted");
            await fetchPaymentMethods();
          } catch (error) {
            Alert.alert("Error", "Failed to delete");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/payment/${id}`, { isDefault: true });
      await fetchPaymentMethods();
    } catch (error) {
      Alert.alert("Error", "Failed to set default");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "credit",
      name: "",
      cardNumber: "",
      cardHolderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      upiId: "",
      isDefault: false,
    });
  };

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      type,
      cardNumber: type === "upi" ? "" : prev.cardNumber,
      cardHolderName: type === "upi" ? "" : prev.cardHolderName,
      expiryMonth: type === "upi" ? "" : prev.expiryMonth,
      expiryYear: type === "upi" ? "" : prev.expiryYear,
      cvv: type === "upi" ? "" : prev.cvv,
      upiId: type !== "upi" ? "" : prev.upiId,
    }));
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "credit":
      case "debit":
        return <CreditCard size={24} color={theme.primary} />;
      case "wallet":
        return <Wallet size={24} color={theme.primary} />;
      default:
        return <DollarSign size={24} color={theme.primary} />;
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Please login to manage payment methods</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity
          onPress={() => {
            setShowForm(!showForm);
            resetForm();
            setEditingId(null);
          }}
        >
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{editingId ? "Edit Payment" : "Add Payment Method"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Name (e.g., My Visa)"
              placeholderTextColor={theme.textMuted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <View style={styles.typeGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeOptions}>
                {["credit", "debit", "upi"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
                    onPress={() => handleTypeChange(type)}
                  >
                    <Text style={[styles.typeText, formData.type === type && styles.typeTextActive]}>
                      {type.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {(formData.type === "credit" || formData.type === "debit") && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Card Number (16 digits)"
                  placeholderTextColor={theme.textMuted}
                  value={formData.cardNumber}
                  onChangeText={(text) => setFormData({ ...formData, cardNumber: text })}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cardholder Name"
                  placeholderTextColor={theme.textMuted}
                  value={formData.cardHolderName}
                  onChangeText={(text) => setFormData({ ...formData, cardHolderName: text })}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="MM"
                    placeholderTextColor={theme.textMuted}
                    value={formData.expiryMonth}
                    onChangeText={(text) => setFormData({ ...formData, expiryMonth: text })}
                    maxLength={2}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 10 }]}
                    placeholder="YY"
                    placeholderTextColor={theme.textMuted}
                    value={formData.expiryYear}
                    onChangeText={(text) => setFormData({ ...formData, expiryYear: text })}
                    maxLength={2}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 10 }]}
                    placeholder="CVV"
                    placeholderTextColor={theme.textMuted}
                    value={formData.cvv}
                    onChangeText={(text) => setFormData({ ...formData, cvv: text })}
                    maxLength={3}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {formData.type === "upi" && (
              <TextInput
                style={styles.input}
                placeholder="UPI ID (e.g., user@bank)"
                placeholderTextColor={theme.textMuted}
                value={formData.upiId}
                onChangeText={(text) => setFormData({ ...formData, upiId: text })}
              />
            )}

            <View style={styles.defaultCheckbox}>
              <TouchableOpacity
                style={[styles.checkbox, formData.isDefault && styles.checkboxActive]}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Set as default payment method</Text>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSavePayment}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>{editingId ? "Update" : "Add"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {methods.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <CreditCard size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No payment methods added</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setShowForm(true);
                setEditingId(null);
                resetForm();
              }}
            >
              <Plus size={20} color={theme.textInverse} />
              <Text style={styles.addButtonText}>Add New Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          methods.map((method) => (
            <View key={method._id} style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>{getPaymentIcon(method.type)}</View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{method.name}</Text>
                  <Text style={styles.cardType}>{method.type.toUpperCase()}</Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <CheckCircle size={20} color={theme.primary} />
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(method._id)}>
                    <Text style={styles.actionText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(method._id)}>
                  <Trash2 size={18} color="#ff3f6c" />
                  <Text style={[styles.actionText, { color: "#ff3f6c" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    center: { justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: theme.text },
    content: { flex: 1, padding: 16 },
    formContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    formTitle: { fontSize: 16, fontWeight: "bold", color: theme.text, marginBottom: 16 },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.inputBackground || theme.background,
    },
    typeGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", color: theme.text, marginBottom: 8 },
    typeOptions: { flexDirection: "row", gap: 8 },
    typeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    typeButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    typeText: { color: theme.text, fontWeight: "600", fontSize: 12 },
    typeTextActive: { color: "white" },
    row: { flexDirection: "row" },
    defaultCheckbox: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.border,
      marginRight: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    checkmark: { color: "white", fontWeight: "bold" },
    checkboxLabel: { color: theme.text, fontSize: 14 },
    formButtons: { flexDirection: "row", gap: 12 },
    button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
    cancelButton: { backgroundColor: theme.surfaceVariant || theme.border },
    cancelButtonText: { color: theme.text, fontWeight: "bold" },
    saveButton: { backgroundColor: theme.primary },
    saveButtonText: { color: "white", fontWeight: "bold" },
    emptyState: { justifyContent: "center", alignItems: "center", paddingVertical: 60 },
    emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 12 },
    paymentCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    cardIconContainer: { marginRight: 12 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: "600", color: theme.text },
    cardType: { fontSize: 12, color: theme.textMuted },
    defaultBadge: { paddingHorizontal: 8 },
    cardActions: { flexDirection: "row", gap: 12 },
    actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
    actionText: { fontSize: 13, fontWeight: "600", color: theme.primary },
    loginPrompt: { flex: 1, justifyContent: "center", alignItems: "center" },
    loginText: { fontSize: 16, color: theme.textMuted },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 14,
      marginTop: 10,
      gap: 8,
    },
    addButtonText: { fontSize: 16, fontWeight: "bold", color: theme.textInverse },
  });
