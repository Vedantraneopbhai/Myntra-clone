import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { ThemeColors } from "@/constants/Theme";
import { getProductImageUrl } from "@/utils/imageUtils";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const { user } = useAuth();

  const handleProductPress = (productId: number) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          supabase.from("categories").select("*"),
          supabase.from("products").select("*")
        ]);

        if (catsRes.error) console.error("Error fetching categories", catsRes.error);
        if (prodsRes.error) console.error("Error fetching products", prodsRes.error);

        // Map Supabase 'id' field to match expected '_id' mapping in UI if needed, 
        // or just pass data (we should adjust the map keys below to use `.id`)
        setcategories(catsRes.data || []);
        setproduct(prodsRes.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/myntra.jpg")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color={theme.icon} />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop",
        }}
        style={styles.banner}
        resizeMode="cover"
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
          ) : !categories || categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories available</Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity key={category.id || category._id} style={styles.categoryCard}>
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dealsScroll}
        >
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={styles.dealCard}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
        </View>
        <View style={styles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
          ) : !product || product.length === 0 ? (
            <Text style={styles.emptyText}>No Product available</Text>
          ) : (
            <View style={styles.productsGrid}>
              {product.map((product: any) => (
                <TouchableOpacity
                  key={product.id || product._id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product.id || product._id)}
                >
                  <Image
                    source={{ uri: getProductImageUrl(product.images, product.category, product.id || product._id) }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.brandName}>{product.brand}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      <Text style={styles.discount}>{product.discount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 0,
    },
    logoImage: {
      width: 120,
      height: 40,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 16,
      color: theme.textMuted,
    },
    searchButton: {
      padding: 8,
      backgroundColor: "transparent",
      borderRadius: 8,
    },
    banner: {
      width: "100%",
      height: 220,
      backgroundColor: theme.skeleton,
    },
    section: {
      padding: 16,
      paddingTop: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.5,
    },
    viewAll: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 5,
    },
    viewAllText: {
      color: theme.primary,
      marginRight: 5,
      fontSize: 13,
      fontWeight: "600",
    },
    categoriesScroll: {
      marginHorizontal: -15,
    },
    categoryCard: {
      width: 120,
      marginHorizontal: 10,
      alignItems: "center",
      justifyContent: "space-between",
    },
    categoryImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.skeleton,
      borderWidth: 3,
      borderColor: theme.primary,
      marginBottom: 12,
    },
    categoryName: {
      textAlign: "center",
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "600",
      lineHeight: 14,
    },
    dealsScroll: {
      marginHorizontal: -15,
    },
    dealCard: {
      width: 280,
      height: 160,
      marginHorizontal: 12,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: theme.skeleton,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 5,
      elevation: 9,
    },
    dealImage: {
      width: "100%",
      height: "100%",
    },
    dealOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.overlay,
      padding: 16,
    },
    dealTitle: {
      color: theme.textInverse,
      fontSize: 18,
      fontWeight: "bold",
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginHorizontal: -8,
    },
    productCard: {
      width: "48%",
      marginHorizontal: "1%",
      marginBottom: 16,
      backgroundColor: theme.surface,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 3.5,
      elevation: 5,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
    },
    productImage: {
      width: "100%",
      height: 200,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: theme.skeleton,
      resizeMode: "cover",
    },
    productInfo: {
      padding: 12,
    },
    brandName: {
      fontSize: 10,
      color: theme.textMuted,
      marginBottom: 5,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    productName: {
      fontSize: 12,
      marginBottom: 8,
      color: theme.text,
      fontWeight: "700",
      lineHeight: 15,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    productPrice: {
      fontSize: 13,
      fontWeight: "bold",
      color: theme.text,
    },
    discount: {
      fontSize: 10,
      color: theme.primary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    loader: {
      marginTop: 50,
    },
  });
