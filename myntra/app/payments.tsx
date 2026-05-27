import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
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
import React, { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

const PAYMENT_METHODS = [
  { id: 1, type: "credit", name: "Credit Card", last4: "4242", isDefault: true },
  { id: 2, type: "debit", name: "Debit Card", last4: "5555", isDefault: false },
  { id: 3, type: "wallet", name: "Wallet", balance: 5000, isDefault: false },
];

export default function Payments() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [methods, setMethods] = useState(PAYMENT_METHODS);

  const handleSetDefault = (id: number) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Payment Method", "Are you sure you want to remove this payment method?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => setMethods(methods.filter((m) => m.id !== id)),
        style: "destructive",
      },
    ]);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <CreditCard size={24} color={theme.primary} />;
      case "debit":
        return <CreditCard size={24} color={theme.primary} />;
      case "wallet":
        return <Wallet size={24} color={theme.primary} />;
      default:
        return <DollarSign size={24} color={theme.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>

          {methods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodContent}>
                <View style={styles.methodIcon}>{getPaymentIcon(method.type)}</View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDetail}>
                    {method.type === "wallet"
                      ? `Balance: ₹${method.balance}`
                      : `**** **** **** ${method.last4}`}
                  </Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text style={styles.setDefaultText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                {method.isDefault && (
                  <CheckCircle size={24} color={theme.primary} />
                )}
                <TouchableOpacity onPress={() => handleDelete(method.id)}>
                  <Trash2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={theme.textInverse} />
            <Text style={styles.addButtonText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Settings</Text>
          <View style={styles.settingsItem}>
            <Text style={styles.settingLabel}>Save payment methods for future use</Text>
            <Switch value={true} trackColor={{ false: theme.border, true: theme.primaryLight }} />
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingLabel}>Enable one-click checkout</Text>
            <Switch value={true} trackColor={{ false: theme.border, true: theme.primaryLight }} />
          </View>
        </View>
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
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 12,
    },
    methodCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    methodContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    methodIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    methodInfo: {
      flex: 1,
    },
    methodName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    methodDetail: {
      fontSize: 14,
      color: theme.textMuted,
    },
    defaultBadge: {
      backgroundColor: theme.primary,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginTop: 4,
      alignSelf: "flex-start",
    },
    defaultText: {
      fontSize: 11,
      fontWeight: "bold",
      color: theme.primaryForeground,
    },
    methodActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    setDefaultButton: {
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
      marginTop: 10,
      gap: 8,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textInverse,
    },
    settingsItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    settingLabel: {
      fontSize: 15,
      color: theme.text,
      fontWeight: "500",
    },
  });
