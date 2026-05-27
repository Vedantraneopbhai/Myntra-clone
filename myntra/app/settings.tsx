import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  HelpCircle,
  AlertCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ThemeColors } from "@/constants/Theme";

export default function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logout } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    orderUpdates: true,
    wishlistAlerts: true,
    cartReminders: true,
    socialSharing: false,
    showProfile: true,
    saveSearchHistory: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Password change functionality would be implemented here"
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: () => {
            logout();
            router.replace("/");
          },
          style: "destructive",
        },
      ]
    );
  };

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    value,
    onToggle,
  }: {
    icon: any;
    label: string;
    description?: string;
    value?: boolean;
    onToggle?: () => void;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Icon size={20} color={theme.primary} style={{ marginRight: 12 }} />
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.primaryLight }}
          thumbColor={value ? theme.primary : theme.textMuted}
          ios_backgroundColor={theme.border}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon={Bell}
              label="Email Notifications"
              description="Receive updates via email"
              value={settings.emailNotifications}
              onToggle={() => handleToggle("emailNotifications")}
            />
            <SettingRow
              icon={Bell}
              label="Push Notifications"
              description="Receive push notifications on your device"
              value={settings.pushNotifications}
              onToggle={() => handleToggle("pushNotifications")}
            />
            <SettingRow
              icon={Bell}
              label="SMS Notifications"
              description="Receive text message updates"
              value={settings.smsNotifications}
              onToggle={() => handleToggle("smsNotifications")}
            />
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon={AlertCircle}
              label="Marketing Emails"
              description="Special deals and promotions"
              value={settings.marketingEmails}
              onToggle={() => handleToggle("marketingEmails")}
            />
            <SettingRow
              icon={AlertCircle}
              label="Order Updates"
              description="Track your order status"
              value={settings.orderUpdates}
              onToggle={() => handleToggle("orderUpdates")}
            />
            <SettingRow
              icon={AlertCircle}
              label="Wishlist Alerts"
              description="When items on your wishlist go on sale"
              value={settings.wishlistAlerts}
              onToggle={() => handleToggle("wishlistAlerts")}
            />
            <SettingRow
              icon={AlertCircle}
              label="Cart Abandonment Reminders"
              description="Reminders for items left in cart"
              value={settings.cartReminders}
              onToggle={() => handleToggle("cartReminders")}
            />
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.settingGroup}>
            <SettingRow
              icon={Eye}
              label="Show Profile to Others"
              description="Allow other users to see your profile"
              value={settings.showProfile}
              onToggle={() => handleToggle("showProfile")}
            />
            <SettingRow
              icon={AlertCircle}
              label="Social Sharing"
              description="Share your purchases on social media"
              value={settings.socialSharing}
              onToggle={() => handleToggle("socialSharing")}
            />
            <SettingRow
              icon={AlertCircle}
              label="Save Search History"
              description="Remember your searches"
              value={settings.saveSearchHistory}
              onToggle={() => handleToggle("saveSearchHistory")}
            />
          </View>
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.settingGroup}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
            >
              <Lock size={20} color={theme.primary} />
              <Text style={styles.actionButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleDeleteAccount}
            >
              <AlertCircle size={20} color={theme.primary} />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.settingRow}>
            <HelpCircle size={20} color={theme.primary} />
            <Text style={styles.settingLabel}>FAQ & Help Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <AlertCircle size={20} color={theme.primary} />
            <Text style={styles.settingLabel}>Report an Issue</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    settingGroup: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingText: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.textMuted,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      gap: 12,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.text,
    },
    dangerButton: {
      borderBottomWidth: 0,
    },
    dangerText: {
      color: theme.primary,
    },
  });
