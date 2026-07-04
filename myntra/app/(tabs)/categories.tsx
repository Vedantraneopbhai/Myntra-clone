import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X, ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";
import { getProductImageSource, getLocalCategoryImage } from "@/utils/imageUtils";
import { supabase } from "@/utils/supabase";

export default function CategoriesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch categories + products from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          supabase.from("categories").select("*"),
          supabase.from("products").select("*"),
        ]);
        if (catsRes.error) console.error("Categories error:", catsRes.error);
        if (prodsRes.error) console.error("Products error:", prodsRes.error);
        setCategories(catsRes.data || []);
        setAllProducts(prodsRes.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Live search — filter products by name/brand
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    const results = allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery, allProducts]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCategory(null);
  };

  // Products for selected category
  const categoryProducts = selectedCategory
    ? allProducts.filter((p) => p.category === selectedCategory)
    : [];

  const selectedCategoryData = categories.find(
    (c) => c.name === selectedCategory
  );

  // ── Product card (grid) ──────────────────────────────────────────
  const renderProductCard = (product: any) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={getProductImageSource(
          product.name,
          product.images,
          product.category,
          product.id
        )}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.brandName} numberOfLines={1}>
          {product.brand || ""}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name || ""}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price ?? 0}</Text>
          {!!product.discount && (
            <Text style={styles.discount}>{product.discount}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Products grid (2-column) ─────────────────────────────────────
  const renderProductsGrid = (products: any[]) => {
    if (!products || products.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      );
    }
    // Pair products into rows of 2
    const rows: any[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(products.slice(i, i + 2));
    }
    return rows.map((row, rIdx) => (
      <View key={rIdx} style={styles.productRow}>
        {row.map((prod) => renderProductCard(prod))}
        {/* Ghost card if odd count */}
        {row.length === 1 && <View style={styles.productCardGhost} />}
      </View>
    ));
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        {selectedCategory ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.headerTitle}>
          {selectedCategory || "Categories"}
        </Text>
      </View>

      {/* ── Search bar ──────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <Search size={18} color={theme.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, brands…"
          placeholderTextColor={theme.textPlaceholder}
          value={searchQuery}
          onChangeText={(t) => {
            setSearchQuery(t);
            if (t) setSelectedCategory(null);
          }}
          returnKeyType="search"
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* ── Search Results ─────────────────────────────────────── */}
        {searchQuery ? (
          <View style={styles.section}>
            {isSearching ? (
              <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
            ) : searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
                </Text>
                {renderProductsGrid(searchResults)}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No results for "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        ) : selectedCategory ? (
          /* ── Category Product Grid ──────────────────────────────── */
          <View style={styles.section}>
            <Text style={styles.resultsHeader}>
              {categoryProducts.length} item{categoryProducts.length !== 1 ? "s" : ""}
            </Text>
            {renderProductsGrid(categoryProducts)}
          </View>
        ) : (
          /* ── Category Cards Grid ──────────────────────────────── */
          <View style={styles.section}>
            <View style={styles.categoriesGrid}>
              {categories.map((cat: any) => {
                const localImg = getLocalCategoryImage(cat.name);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(cat.name)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={localImg ?? { uri: cat.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                    <View style={styles.categoryOverlay}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryCount}>
                        {allProducts.filter((p) => p.category === cat.name).length} items
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
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

    // ── Header ──────────────────────────────────────────────────────
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 52,
      paddingBottom: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      gap: 10,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      letterSpacing: 0.2,
    },

    // ── Search ──────────────────────────────────────────────────────
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      padding: 0,
    },

    // ── Content ──────────────────────────────────────────────────────
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 12,
      paddingTop: 4,
    },
    resultsHeader: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: "600",
      paddingHorizontal: 4,
      paddingBottom: 12,
      paddingTop: 4,
    },

    // ── Category grid (2 columns, large cards) ──────────────────────
    categoriesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    categoryCard: {
      width: "47%",
      height: 180,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: theme.skeleton,
      marginBottom: 2,
    },
    categoryImage: {
      width: "100%",
      height: "100%",
    },
    categoryOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.52)",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: 0.3,
    },
    categoryCount: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      marginTop: 2,
    },

    // ── Product grid (2 columns) ─────────────────────────────────────
    productRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    productCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 3,
    },
    productCardGhost: {
      flex: 1,
    },
    productImage: {
      width: "100%",
      height: 190,
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
      fontWeight: "600",
      color: theme.text,
      lineHeight: 17,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    price: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text,
    },
    discount: {
      fontSize: 11,
      color: theme.primary,
      fontWeight: "800",
    },

    // ── States ───────────────────────────────────────────────────────
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textMuted,
      textAlign: "center",
    },
  });
