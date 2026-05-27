import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MapPin,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  CheckCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

const SAMPLE_ADDRESSES = [
  {
    id: 1,
    label: "Home",
    address: "123 Main Street, Apartment 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    address: "456 Business Avenue, Suite 200",
    city: "New York",
    state: "NY",
    zip: "10002",
    isDefault: false,
  },
];

export default function Addresses() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [addresses, setAddresses] = useState(SAMPLE_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleDelete = (id: number) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this address?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => setAddresses(addresses.filter((a) => a.id !== id)),
        style: "destructive",
      },
    ]);
  };

  const handleSetDefault = (id: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  const handleSaveAddress = () => {
    if (!formData.label || !formData.address || !formData.city) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (editingId) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingId ? { ...addr, ...formData } : addr
        )
      );
      setEditingId(null);
    } else {
      setAddresses([
        ...addresses,
        {
          id: Math.max(...addresses.map((a) => a.id), 0) + 1,
          ...formData,
          isDefault: false,
        },
      ]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ label: "", address: "", city: "", state: "", zip: "" });
    setShowForm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Addresses List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>

          {addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.addressContent}>
                <View style={styles.addressIcon}>
                  <MapPin size={20} color={theme.primary} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{addr.address}</Text>
                  <Text style={styles.addressText}>
                    {addr.city}, {addr.state} {addr.zip}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                {!addr.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => handleSetDefault(addr.id)}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                {addr.isDefault && <CheckCircle size={20} color={theme.primary} />}
                <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                  <Trash2 size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add New Address Form */}
        {showForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {editingId ? "Edit Address" : "Add New Address"}
            </Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Label (e.g., Home, Office)"
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
                placeholderTextColor={theme.textPlaceholder}
              />
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholderTextColor={theme.textPlaceholder}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholderTextColor={theme.textPlaceholder}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholderTextColor={theme.textPlaceholder}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="ZIP Code"
                  value={formData.zip}
                  onChangeText={(text) => setFormData({ ...formData, zip: text })}
                  placeholderTextColor={theme.textPlaceholder}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.saveButtonText}>SAVE ADDRESS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add Address Button */}
        {!showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Plus size={20} color={theme.textInverse} />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 50,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    addressCard: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    addressContent: {
      flexDirection: "row",
      marginBottom: 10,
    },
    addressIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    addressInfo: {
      flex: 1,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    addressLabel: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.text,
    },
    defaultBadge: {
      backgroundColor: theme.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    defaultText: {
      fontSize: 10,
      fontWeight: "bold",
      color: theme.primaryForeground,
    },
    addressText: {
      fontSize: 13,
      color: theme.textMuted,
      marginBottom: 2,
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },
    setDefaultBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    setDefaultText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.primary,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 14,
      gap: 8,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textInverse,
    },
    form: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.text,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    row: {
      flexDirection: "row",
      marginBottom: 10,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 8,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.primaryForeground,
    },
    cancelButton: {
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.primary,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.primary,
    },
  });
