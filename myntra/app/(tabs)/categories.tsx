import {
  StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";
import { getProductImageUrl } from "@/utils/imageUtils";

export default function TabTwoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get(`${API_BASE_URL}/category`);
        setcategories(cat.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const res = await axios.get(`${API_BASE_URL}/product/search/${query}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    setSearchQuery("");
  };

  const filtercategories = categories?.filter(
    (category: any) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategory.some((subcategory: any) =>
        subcategory.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedcategorydata = selectedCategory
    ? categories?.find((cat: any) => cat._id === selectedCategory)
    : null;

  const renderProducts = (products: any) => {
    if (!Array.isArray(products) || products.length === 0) {
      return (
        <View style={styles.noProductsState}>
          <Text style={styles.noProductsText}>No products found in this category</Text>
        </View>
      );
    }

    return products.map((product: any) => (
      <TouchableOpacity
        key={product._id}
        style={styles.productCard}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <Image
          source={{
            uri: getProductImageUrl(product.images, product.category, product._id),
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.brandName}>{product?.brand || "Unknown brand"}</Text>
          <Text style={styles.productName}>{product?.name || "Unknown product"}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product?.price ?? 0}</Text>
            <Text style={styles.discount}>{product?.discount || ""}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!categories) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Categories not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products, brands and more"
            placeholderTextColor={theme.textPlaceholder}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Show search results if searching */}
        {searchQuery && (
          <View>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <View>
                <Text style={styles.resultsTitle}>Search Results ({searchResults.length})</Text>
                <View style={styles.productsGrid}>
                  {renderProducts(searchResults)}
                </View>
              </View>
            ) : (
              <View style={styles.noProductsState}>
                <Text style={styles.noProductsText}>No products found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        )}

        {/* Show categories if not searching */}
        {!selectedCategory && !searchQuery && (
          <View style={styles.categoriesGrid}>
            {filtercategories?.map((category: any) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(category._id)}
              >
                <Image
                  source={{
                    uri:
                      category?.image ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
                  }}
                  style={styles.categoryImage}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.subcategories}>
                      {category?.subcategory?.map((sub: any, index: any) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.subcategoryTag}
                          onPress={() => handleSubcategorySelect(sub)}
                        >
                          <Text style={styles.subcategoryText}>{sub}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Show selected category products */}
        {selectedcategorydata && (
          <View style={styles.categoryDetail}>
            <View style={styles.categoryHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.backButtonText}>← Back to Categories</Text>
              </TouchableOpacity>
              <Text style={styles.categoryTitle}>{selectedcategorydata.name}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoriesScroll}
            >
              {selectedcategorydata.subcategory.map((sub: any, index: any) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subcategoryButton,
                    selectedSubcategory === sub && styles.selectedSubcategory,
                  ]}
                  onPress={() => handleSubcategorySelect(sub)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      selectedSubcategory === sub && styles.selectedSubcategoryText,
                    ]}
                  >
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.productsGrid}>
              {renderProducts(selectedcategorydata?.productId)}
            </View>
          </View>
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
    notFoundText: {
      color: theme.text,
      textAlign: "center",
      marginTop: 40,
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
    searchContainer: {
      gap: 15,
    },
    categoryCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryImage: {
      width: "100%",
      height: 150,
      backgroundColor: theme.inputBackground,
    },
    categoryInfo: {
      padding: 12,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    subcategories: {
      flexDirection: "row",
      gap: 6,
    },
    subcategoryTag: {
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 8,
    },
    subcategoryText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    categoryDetail: {
      padding: 15,
    },
    categoryHeader: {
      marginBottom: 15,
    },
    backButton: {
      paddingVertical: 8,
      marginBottom: 10,
    },
    backButtonText: {
      color: theme.primary,
      fontWeight: "bold",
      fontSize: 14,
    },
    categoryTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    subcategoriesScroll: {
      marginBottom: 15,
      flexGrow: 0,
    },
    subcategoryButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.inputBackground,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    selectedSubcategory: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    subcategoryButtonText: {
      color: theme.text,
      fontWeight: "600",
      fontSize: 13,
    },
    selectedSubcategoryText: {
      color: "white",
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    productCard: {
      width: "48%",
      backgroundColor: theme.surface,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    productImage: {
      width: "100%",
      height: 180,
      backgroundColor: theme.inputBackground,
    },
    productInfo: {
      padding: 10,
    },
    brandName: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 4,
    },
    productName: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 6,
      numberOfLines: 2,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    price: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    discount: {
      fontSize: 12,
      color: theme.primary,
    },
    noProductsState: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    noProductsText: {
      fontSize: 16,
      color: theme.textMuted,
      textAlign: "center",
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 12,
    },
    resultsTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      padding: 15,
      paddingBottom: 10,
    },
  });
