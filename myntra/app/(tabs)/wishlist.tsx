import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { Heart, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { ThemeColors } from "@/constants/Theme";
import { getProductImageSource } from "@/utils/imageUtils";

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [wishlist, setwishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("wishlist_items")
          .select("*, productId:products(*)")
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        const mappedData = data?.map((item: any) => ({
          ...item,
          _id: item.id
        })) || [];
        
        setwishlist(mappedData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", itemid);
      if (error) throw error;
      fetchproduct();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>
        <View style={styles.emptyState}>
          <Heart size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>Please login to view your wishlist</Text>
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

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const validWishlist = Array.isArray(wishlist)
    ? wishlist.filter((item) => item?.productId)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
      </View>

      <ScrollView style={styles.content}>
        {validWishlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color={theme.primary} />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          </View>
        ) : (
          validWishlist.map((item: any) => {
            const product = item.productId;
            return (
              <View key={item._id} style={styles.wishlistItem}>
                <Image
                  source={getProductImageSource(product?.name, product?.images, product?.category, product?._id)}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.brandName}>
                    {product?.brand || "Unknown brand"}
                  </Text>
                  <Text style={styles.itemName}>
                    {product?.name || "Unknown product"}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{product?.price ?? 0}</Text>
                    <Text style={styles.discount}>{product?.discount || ""}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handledelete(item._id)}
                >
                  <Trash2 size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
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
      padding: 15,
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
    wishlistItem: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 6,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
    },
    itemImage: {
      width: 130,
      height: 150,
      backgroundColor: theme.skeleton,
    },
    itemInfo: {
      flex: 1,
      padding: 16,
      justifyContent: "space-between",
    },
    brandName: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 6,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    itemName: {
      fontSize: 15,
      color: theme.text,
      marginBottom: 10,
      fontWeight: "700",
      lineHeight: 18,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    price: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    discount: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "800",
    },
    removeButton: {
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  });
