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

export default function TabTwoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setcategories] = useState<any[]>([]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    setSearchQuery("");
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
      ) ||
      (Array.isArray(category.productId) ? category.productId : []).some(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
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
            uri:
              product?.images?.[0] ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
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
        {!selectedCategory && (
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
      padding: 15,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 10,
      padding: 10,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    content: {
      flex: 1,
    },
    categoriesGrid: {
      padding: 15,
    },
    categoryCard: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      overflow: "hidden",
    },
    categoryImage: {
      width: "100%",
      height: 150,
    },
    categoryInfo: {
      padding: 15,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
    },
    subcategories: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    subcategoryTag: {
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginRight: 8,
      marginBottom: 8,
    },
    subcategoryText: {
      fontSize: 14,
      color: theme.textMuted,
    },
    categoryDetail: {
      flex: 1,
      padding: 15,
    },
    categoryHeader: {
      marginBottom: 15,
    },
    backButton: {
      marginBottom: 10,
    },
    backButtonText: {
      color: theme.primary,
      fontSize: 16,
    },
    categoryTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    subcategoriesScroll: {
      marginBottom: 15,
    },
    subcategoryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.inputBackground,
      marginRight: 10,
    },
    selectedSubcategory: {
      backgroundColor: theme.primary,
    },
    subcategoryButtonText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    selectedSubcategoryText: {
      color: theme.primaryForeground,
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    productCard: {
      width: "48%",
      backgroundColor: theme.surface,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      overflow: "hidden",
    },
    productImage: {
      width: "100%",
      height: 200,
    },
    noProductsState: {
      width: "100%",
      paddingVertical: 20,
      alignItems: "center",
    },
    noProductsText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    productInfo: {
      padding: 10,
    },
    brandName: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 4,
    },
    productName: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    price: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginRight: 8,
    },
    discount: {
      fontSize: 14,
      color: theme.primary,
    },
  });
