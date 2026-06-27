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
  MapPin,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
} from "lucide-react-native";
import React, { useMemo, useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeColors } from "@/constants/Theme";
import { supabase } from "@/utils/supabase";

export default function Addresses() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user.id);
      if (error) throw error;
      const mappedData = data?.map(a => ({
        ...a,
        _id: a.id,
        fullName: a.full_name,
        phoneNumber: a.phone_number,
        zipCode: a.zip_code,
        isDefault: a.is_default
      })) || [];
      setAddresses(mappedData);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        user_id: user.id,
        label: formData.label,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        is_default: formData.isDefault,
      };

      if (editingId) {
        const { error } = await supabase.from("addresses").update(payload).eq("id", editingId);
        if (error) throw error;
        Alert.alert("Success", "Address updated successfully");
      } else {
        const { error } = await supabase.from("addresses").insert(payload);
        if (error) throw error;
        Alert.alert("Success", "Address added successfully");
      }

      await fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      console.error("Error saving address:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this address?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const { error } = await supabase.from("addresses").delete().eq("id", id);
            if (error) throw error;
            Alert.alert("Success", "Address deleted");
            await fetchAddresses();
          } catch (error) {
            Alert.alert("Error", "Failed to delete address");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = (address: any) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      fullName: "",
      phoneNumber: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Addresses</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Please login to manage addresses</Text>
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
        <Text style={styles.headerTitle}>Addresses</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addButton}>
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{editingId ? "Edit Address" : "Add New Address"}</Text>

            <View style={styles.labelGroup}>
              <Text style={styles.label}>Label</Text>
              <View style={styles.labelOptions}>
                {["Home", "Work", "Other"].map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.labelButton, formData.label === label && styles.labelButtonActive]}
                    onPress={() => setFormData({ ...formData, label })}
                  >
                    <Text style={[styles.labelButtonText, formData.label === label && styles.labelButtonTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={theme.textMuted}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={theme.textMuted}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={theme.textMuted}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="City"
                placeholderTextColor={theme.textMuted}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 10 }]}
                placeholder="State"
                placeholderTextColor={theme.textMuted}
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Zip Code"
              placeholderTextColor={theme.textMuted}
              value={formData.zipCode}
              onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
            />

            <View style={styles.defaultCheckbox}>
              <TouchableOpacity
                style={[styles.checkbox, formData.isDefault && styles.checkboxActive]}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                {formData.isDefault && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveAddress}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveButtonText}>{editingId ? "Update" : "Save"}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {addresses.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color={theme.textMuted} />
            <Text style={styles.emptyText}>No addresses added yet</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowForm(true)}>
              <Plus size={20} color="white" />
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressName}>{address.fullName}</Text>
              <Text style={styles.addressPhone}>{address.phoneNumber}</Text>
              <Text style={styles.addressText}>{address.address}</Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </Text>

              <View style={styles.addressActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(address)}>
                  <Edit size={18} color={theme.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(address._id)}>
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
    addButton: { padding: 8 },
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
    labelGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: "600", color: theme.text, marginBottom: 8 },
    labelOptions: { flexDirection: "row", gap: 8 },
    labelButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    labelButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    labelButtonText: { color: theme.text, fontWeight: "600" },
    labelButtonTextActive: { color: "white" },
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
    addFirstButton: {
      flexDirection: "row",
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 16,
      alignItems: "center",
      gap: 8,
    },
    addFirstButtonText: { color: "white", fontWeight: "bold" },
    addressCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    addressLabel: { fontSize: 14, fontWeight: "bold", color: theme.text },
    defaultBadge: { backgroundColor: theme.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    defaultBadgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
    addressName: { fontSize: 15, fontWeight: "600", color: theme.text, marginBottom: 4 },
    addressPhone: { fontSize: 13, color: theme.textMuted, marginBottom: 8 },
    addressText: { fontSize: 13, color: theme.textMuted, marginBottom: 4 },
    addressActions: { flexDirection: "row", gap: 12, marginTop: 12 },
    actionButton: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, paddingVertical: 8 },
    actionText: { fontSize: 13, fontWeight: "600", color: theme.primary },
    loginPrompt: { flex: 1, justifyContent: "center", alignItems: "center" },
    loginText: { fontSize: 16, color: theme.textMuted },
  });
