import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { ThemeColors } from "@/constants/Theme";
import {
  getProductImageSource,
  getLocalCategoryImage,
  CATEGORY_IMAGES,
} from "@/utils/imageUtils";

// ─── Banner images ──────────────────────────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    uri: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&auto=format&fit=crop",
    label: "New Arrivals",
  },
  {
    id: 2,
    uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop",
    label: "Trending Now",
  },
  {
    id: 3,
    uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop",
    label: "Flat 40–70% Off",
  },
];

// ─── Deal / promo cards ──────────────────────────────────────────────────────
const deals = [
  {
    id: 1,
    title: "Under ₹599",
    subtitle: "Top picks every day",
    uri: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40–70% Off",
    subtitle: "Limited time deals",
    uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Brand of the Week",
    subtitle: "Featured collections",
    uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, screenWidth),
    [theme, screenWidth]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { user } = useAuth();

  // Banner auto-scroll
  const bannerRef = useRef<FlatList>(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (bannerIdx + 1) % BANNERS.length;
      setBannerIdx(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3500);
    return () => clearInterval(timer);
  }, [bannerIdx]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          supabase.from("categories").select("*"),
          supabase.from("products").select("*"),
        ]);
        if (catsRes.error) console.error("Categories error", catsRes.error);
        if (prodsRes.error) console.error("Products error", prodsRes.error);
        setCategories(catsRes.data || []);
        setProducts(prodsRes.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductPress = (productId: number) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };

  // Split products for two carousel sections
  const trendingProducts = products.slice(0, Math.ceil(products.length / 2));
  const recommendedProducts = products.slice(Math.ceil(products.length / 2));

  // Card width: 45% of screen so ~2.2 cards visible (peek effect)
  const CARD_WIDTH = screenWidth * 0.45;

  const renderProductCard = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.productCard, { width: CARD_WIDTH }]}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.85}
    >
      <Image
        source={getProductImageSource(item.name, item.images, item.category, item.id)}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.brandName} numberOfLines={1}>
          {item.brand}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {!!item.discount && (
            <Text style={styles.discount}>{item.discount}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCarouselSection = (
    title: string,
    data: any[],
    showViewAll = true
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => router.push("/categories")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 20 }}
        />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>No products available</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 12}
          snapToAlignment="start"
        >
          {data.map((item) => renderProductCard(item))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/myntra.jpg")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push("/categories")}
        >
          <Search size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>

      {/* ── Hero Banner Carousel ────────────────────────────────────── */}
      <View style={styles.bannerContainer}>
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          keyExtractor={(b) => String(b.id)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth, height: 230 }}>
              <Image
                source={{ uri: item.uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerLabel}>{item.label}</Text>
              </View>
            </View>
          )}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / screenWidth
            );
            setBannerIdx(idx);
          }}
        />
        {/* Dots */}
        <View style={styles.bannerDots}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === bannerIdx && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* ── Shop by Category ──────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => router.push("/categories")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories available</Text>
          ) : (
            categories.map((cat: any) => {
              const localImg = getLocalCategoryImage(cat.name);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => router.push("/categories")}
                  activeOpacity={0.8}
                >
                  <Image
                    source={localImg ?? { uri: cat.image }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* ── Deals of the Day ──────────────────────────────────────── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dealsContent}
          decelerationRate="fast"
          snapToInterval={screenWidth * 0.72 + 12}
          snapToAlignment="start"
        >
          {deals.map((deal) => (
            <TouchableOpacity
              key={deal.id}
              style={[styles.dealCard, { width: screenWidth * 0.72 }]}
              activeOpacity={0.9}
            >
              <Image source={{ uri: deal.uri }} style={styles.dealImage} resizeMode="cover" />
              <View style={styles.dealOverlay}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Trending Now Carousel ─────────────────────────────────── */}
      {renderCarouselSection("TRENDING NOW 🔥", trendingProducts)}

      {/* ── Recommended For You Carousel ─────────────────────────── */}
      {renderCarouselSection("RECOMMENDED FOR YOU ✨", recommendedProducts)}

      {/* ── Bottom spacing ─────────────────────────────────────────── */}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const createStyles = (theme: ThemeColors, screenWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // ── Header ──────────────────────────────────────────────────────
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    logoImage: {
      width: 110,
      height: 36,
    },
    searchButton: {
      padding: 8,
      borderRadius: 8,
    },

    // ── Banner ──────────────────────────────────────────────────────
    bannerContainer: {
      position: "relative",
    },
    bannerOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: "rgba(0,0,0,0.38)",
    },
    bannerLabel: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    bannerDots: {
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 6,
      backgroundColor: theme.background,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.border,
    },
    dotActive: {
      width: 18,
      backgroundColor: theme.primary,
    },

    // ── Sections ────────────────────────────────────────────────────
    section: {
      paddingTop: 20,
      paddingBottom: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.6,
    },
    viewAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    viewAllText: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 14,
      color: theme.textMuted,
      paddingHorizontal: 16,
    },

    // ── Categories ──────────────────────────────────────────────────
    categoriesContent: {
      paddingHorizontal: 12,
      gap: 8,
    },
    categoryCard: {
      width: 88,
      marginHorizontal: 6,
      alignItems: "center",
    },
    categoryImage: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: theme.skeleton,
      borderWidth: 2.5,
      borderColor: theme.primary,
      marginBottom: 8,
    },
    categoryName: {
      textAlign: "center",
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "700",
      letterSpacing: 0.2,
    },

    // ── Deals ───────────────────────────────────────────────────────
    dealsContent: {
      paddingHorizontal: 16,
      gap: 12,
    },
    dealCard: {
      height: 170,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: theme.skeleton,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 8,
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
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    dealTitle: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    dealSubtitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      marginTop: 2,
    },

    // ── Product carousel ─────────────────────────────────────────────
    carouselContent: {
      paddingHorizontal: 16,
      gap: 12,
      paddingBottom: 4,
    },
    productCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    productImage: {
      width: "100%",
      height: 200,
      backgroundColor: theme.skeleton,
    },
    productInfo: {
      padding: 12,
      paddingBottom: 14,
    },
    brandName: {
      fontSize: 10,
      color: theme.textMuted,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
    },
    productName: {
      fontSize: 13,
      color: theme.text,
      fontWeight: "600",
      lineHeight: 17,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
    },
    discount: {
      fontSize: 11,
      color: theme.primary,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
  });
