import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Receipt,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

const menuItems = [
  { icon: Package, label: "Orders", route: "/orders" },
  { icon: Heart, label: "Wishlist", route: "/wishlist" },
  { icon: CreditCard, label: "Payment Methods", route: "/payments" },
  { icon: MapPin, label: "Addresses", route: "/addresses" },
  { icon: Receipt, label: "My Transactions", route: "/transactions" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.emptyState}>
          <User size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>Please login to view your profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={40} color={theme.textInverse} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color={theme.icon} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={24} color={theme.icon} />
            </TouchableOpacity>
          ))}

          {/* ── Dark Mode Toggle ─────────────────────────────── */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              {themeMode === "dark" ? (
                <Moon size={24} color={theme.icon} />
              ) : (
                <Sun size={24} color={theme.icon} />
              )}
              <Text style={styles.menuItemLabel}>
                {themeMode === "dark" ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Switch
              value={themeMode === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={themeMode === "dark" ? theme.primary : theme.textMuted}
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color={theme.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
      padding: 15,
      paddingTop: 50,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyTitle: {
      fontSize: 18,
      color: theme.textSecondary,
      marginTop: 20,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
    },
    loginButtonText: {
      color: theme.primaryForeground,
      fontSize: 16,
      fontWeight: "bold",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.surface,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    userDetails: {
      marginLeft: 15,
    },
    userName: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
    },
    userEmail: {
      fontSize: 14,
      color: theme.textMuted,
    },
    menuSection: {
      marginTop: 20,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemLabel: {
      fontSize: 16,
      color: theme.textSecondary,
      marginLeft: 15,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      marginTop: 20,
      marginHorizontal: 15,
      borderRadius: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    logoutText: {
      marginLeft: 10,
      fontSize: 16,
      color: theme.primary,
      fontWeight: "bold",
    },
  });
