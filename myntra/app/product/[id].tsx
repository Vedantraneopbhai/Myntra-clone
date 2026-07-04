import { useState, useEffect, useRef, useMemo } from "react";
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, ShoppingBag } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { ThemeColors } from "@/constants/Theme";
import { getCarouselImages } from "@/utils/imageUtils";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const screenWidth = width || 360;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { user, addToRecentlyViewed } = useAuth();
  const [product, setproduct] = useState<any>(null);
  const [iswishlist, setiswishlist] = useState(false);

  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        setproduct(data);
        
        try { 
          if (addToRecentlyViewed && user) { 
            await addToRecentlyViewed(id as string, data); 
          }
        }
        catch (e) { console.error("Error tracking recently viewed:", e); }
      } catch (error) { console.error(error); }
      finally { setIsLoading(false); }
    };
    if (id) { fetchproduct(); }
  }, [id]);

  useEffect(() => {
    if (!product) return;
    
    const carouselImages = getCarouselImages(product?.images, product?.category, product?.name);
    const autoScrollInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(autoScrollInterval);
  }, [product]);

  const handleScroll = (event: any) => {
    if (!product) return;
    const carouselImages = getCarouselImages(product?.images, product?.category, product?.name);
    const imageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(imageIndex % carouselImages.length);
  };

  const handleAddwishlist = async () => {
    if (!user) { router.push("/login"); return; }
    try {
      const { error } = await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: id });
      if (error) throw error;
      setiswishlist(true);
      router.push("/wishlist");
    } catch (error) { console.error(error); }
  };

  const handleAddToBag = async () => {
    if (!user) { router.push("/login"); return; }
    if (!selectedSize) { alert("Please select a size"); return; }
    try {
      setLoading(true);
      const { error } = await supabase.from("cart_items").insert({ 
        user_id: user.id, 
        product_id: id, 
        size: selectedSize, 
        quantity: 1, 
        price_at_addition: product.price 
      });
      if (error) throw error;
      router.push("/bag");
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return <View style={styles.container}><Text style={styles.notFoundText}>Product not found</Text></View>;
  }

  const carouselImages = getCarouselImages(product?.images, product?.category, product?.name);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* ── Image Carousel ────────────────────────────────────────── */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {carouselImages.map((src, idx) => (
              <Image
                key={idx}
                source={src}
                style={[styles.productImage, { width: screenWidth }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Dot indicators */}
          {carouselImages.length > 1 && (
            <View style={styles.dotsContainer}>
              {carouselImages.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
            </View>
            <TouchableOpacity style={styles.wishlistButton} onPress={handleAddwishlist}>
              <Heart size={24} color={iswishlist ? theme.primary : theme.border} fill={iswishlist ? theme.primary : "none"} />
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.sizeSection}>
            <Text style={styles.sizeTitle}>Select Size</Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeButton, selectedSize === size && styles.selectedSize]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToBagButton} onPress={handleAddToBag} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.primaryForeground} />
          ) : (
            <>
              <ShoppingBag size={20} color={theme.primaryForeground} />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  notFoundText: { color: theme.text, textAlign: "center", marginTop: 40 },
  carouselContainer: { position: "relative", width: "100%" },
  productImage: { height: 420 },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#fff",
  },
  content: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 16, color: theme.textMuted, marginBottom: 5 },
  name: { fontSize: 20, fontWeight: "bold", color: theme.text, marginBottom: 10 },
  wishlistButton: { padding: 10 },
  priceContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  price: { fontSize: 20, fontWeight: "bold", color: theme.text, marginRight: 10 },
  discount: { fontSize: 16, color: theme.primary },
  description: { fontSize: 16, color: theme.textMuted, lineHeight: 24, marginBottom: 20 },
  sizeSection: { marginBottom: 20 },
  sizeTitle: { fontSize: 16, fontWeight: "bold", color: theme.text, marginBottom: 10 },
  sizeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: theme.border, justifyContent: "center", alignItems: "center" },
  selectedSize: { borderColor: theme.primary, backgroundColor: theme.primaryLight },
  sizeText: { fontSize: 16, color: theme.textSecondary },
  selectedSizeText: { color: theme.primary },
  footer: { padding: 15, backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border },
  addToBagButton: { backgroundColor: theme.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 10, gap: 10 },
  addToBagText: { color: theme.primaryForeground, fontSize: 16, fontWeight: "bold" },
});
