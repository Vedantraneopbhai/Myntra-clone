import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Minus, Plus, Trash2, Heart, RefreshCw, AlertCircle } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/utils/supabase";
import { ThemeColors } from "@/constants/Theme";
import { getProductImageSource } from "@/utils/imageUtils";

export default function Bag() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { user } = useAuth();
  const [bag, setbag] = useState<any[]>([]);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("cart_items")
          .select("*, productId:products(*)")
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        // Map fields to match existing UI logic
        const mappedData = data?.map((item: any) => ({
          ...item,
          _id: item.id,
          isSavedForLater: item.is_saved_for_later,
        })) || [];
        
        setbag(mappedData);
      } catch (error) {
        console.error("Error fetching bag:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handledelete = async (itemid: string) => {
    try {
      setLoadingAction(itemid);
      const { error } = await supabase.from("cart_items").delete().eq("id", itemid);
      if (error) throw error;
      await fetchproduct();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not remove item from bag.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateQuantity = async (item: any, increment: boolean) => {
    const newQty = increment ? item.quantity + 1 : item.quantity - 1;
    if (newQty <= 0) {
      handledelete(item._id);
      return;
    }

    const availableStock = item.availableStock ?? 999;
    if (increment && newQty > availableStock) {
      Alert.alert("Stock Limit Reached", `Only ${availableStock} items are available in stock.`);
      return;
    }

    try {
      setLoadingAction(item._id);
      const { error } = await supabase.from("cart_items").update({ quantity: newQty }).eq("id", item._id);
      if (error) throw error;
      await fetchproduct();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not update quantity.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveForLater = async (itemid: string) => {
    try {
      setLoadingAction(itemid);
      const { error } = await supabase.from("cart_items").update({ is_saved_for_later: true }).eq("id", itemid);
      if (error) throw error;
      await fetchproduct();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not save for later.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveToBag = async (item: any) => {
    if (item.isDiscontinued) {
      Alert.alert("Unavailable", "This product is discontinued and cannot be purchased.");
      return;
    }
    if (item.outOfStock) {
      Alert.alert("Out of Stock", "This item is currently out of stock.");
      return;
    }

    try {
      setLoadingAction(item._id);
      const { error } = await supabase.from("cart_items").update({ is_saved_for_later: false }).eq("id", item._id);
      if (error) throw error;
      await fetchproduct();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Could not move item to bag.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptPrices = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Fetch fresh products and update cart items
      // In a real app this might require a custom rpc or batched updates.
      // For now we'll just refetch bag to simulate.
      await fetchproduct();
      Alert.alert("Success", "Price updates acknowledged successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not acknowledge price updates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Separate active and saved items
  const activeItems = bag.filter((item) => !item.isSavedForLater);
  const savedItems = bag.filter((item) => item.isSavedForLater);

  // Compute total based ONLY on active items
  const total = activeItems.reduce(
    (sum, item) => sum + (item.productId?.price ?? 0) * item.quantity,
    0
  );

  // Validation flags for active cart
  const hasDiscontinued = activeItems.some((item) => item.isDiscontinued);
  const hasOutOfStock = activeItems.some((item) => item.outOfStock);
  const hasStockMismatch = activeItems.some((item) => item.stockMismatch);
  const hasPriceChanges = activeItems.some((item) => item.priceChanged);
  const hasCheckoutBlockers = hasDiscontinued || hasOutOfStock || hasStockMismatch || hasPriceChanges;

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <ShoppingBag size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>Please login to view your bag</Text>
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

  if (isLoading && bag.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
        {activeItems.length > 0 && (
          <Text style={styles.headerSubtitle}>{activeItems.length} items in your bag</Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Price Change Warning Banner */}
        {hasPriceChanges && (
          <View style={styles.priceWarningBanner}>
            <View style={styles.warningRow}>
              <AlertCircle size={20} color="#ff3f6c" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Prices have changed for some items since you added them. Please accept the new prices to proceed.
              </Text>
            </View>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPrices}>
              <RefreshCw size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.acceptButtonText}>ACCEPT NEW PRICES</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Checkout Blocker General Banner */}
        {(hasDiscontinued || hasOutOfStock || hasStockMismatch) && (
          <View style={styles.blockerBanner}>
            <AlertCircle size={20} color="#ff9f00" style={styles.warningIcon} />
            <Text style={styles.blockerText}>
              Some active items are out of stock or discontinued. Remove or edit them to place your order.
            </Text>
          </View>
        )}

        {/* Empty Active State */}
        {activeItems.length === 0 && (
          <View style={styles.emptyActiveState}>
            <ShoppingBag size={48} color={theme.textPlaceholder} />
            <Text style={styles.emptyActiveText}>Your Shopping Bag is empty</Text>
          </View>
        )}

        {/* Active Items List */}
        {activeItems.map((item) => {
          const product = item.productId || {};

          return (
            <View key={item._id} style={[styles.bagItem, item.outOfStock || item.isDiscontinued ? styles.disabledItem : {}]}>
              <Image
                source={getProductImageSource(product.name, product.images, product.category, product._id)}
                style={styles.itemImage}
              />
              
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.brandName}>{product.brand || "Brand"}</Text>
                  <TouchableOpacity onPress={() => handledelete(item._id)} style={styles.trashIcon}>
                    <Trash2 size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.itemName} numberOfLines={1}>{product.name || "Product Name"}</Text>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                  <Text style={styles.bullet}>•</Text>
                  
                  {/* Stock Status Badges */}
                  {item.isDiscontinued ? (
                    <Text style={styles.discontinuedBadge}>Discontinued</Text>
                  ) : item.outOfStock ? (
                    <Text style={styles.outOfStockBadge}>Out of Stock</Text>
                  ) : item.stockMismatch ? (
                    <Text style={styles.outOfStockBadge}>Insufficient Stock (Avail: {item.availableStock})</Text>
                  ) : item.lowStock ? (
                    <Text style={styles.lowStockBadge}>Only {item.availableStock} left!</Text>
                  ) : (
                    <Text style={styles.inStockBadge}>In Stock</Text>
                  )}
                </View>

                {/* Price Display with Change Indicator */}
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>₹{product.price}</Text>
                  {item.priceChanged && (
                    <Text style={styles.priceDifference}>
                      (Was: ₹{item.oldPrice})
                    </Text>
                  )}
                </View>

                {/* Interactive Selectors and Save button */}
                <View style={styles.actionRow}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item, false)}
                      disabled={loadingAction === item._id}
                    >
                      <Minus size={16} color={theme.icon} />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantity}>
                      {loadingAction === item._id ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                      ) : (
                        item.quantity
                      )}
                    </Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item, true)}
                      disabled={loadingAction === item._id || item.outOfStock || item.isDiscontinued}
                    >
                      <Plus size={16} color={theme.icon} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.saveForLaterButton}
                    onPress={() => handleSaveForLater(item._id)}
                    disabled={loadingAction === item._id}
                  >
                    <Heart size={16} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.saveForLaterText}>SAVE FOR LATER</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Save For Later Section */}
        {savedItems.length > 0 && (
          <View style={styles.savedSection}>
            <View style={styles.savedHeader}>
              <Heart size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={styles.savedTitle}>Saved For Later ({savedItems.length} Items)</Text>
            </View>
            
            {savedItems.map((item) => {
              const product = item.productId || {};

              return (
                <View key={item._id} style={[styles.savedItemCard]}>
                  <Image
                    source={getProductImageSource(product.name, product.images, product.category, product._id)}
                    style={styles.savedItemImage}
                  />
                  
                  <View style={styles.savedItemInfo}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.brandName}>{product.brand || "Brand"}</Text>
                      <TouchableOpacity onPress={() => handledelete(item._id)}>
                        <Trash2 size={18} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.itemName} numberOfLines={1}>{product.name || "Product Name"}</Text>
                    <Text style={styles.itemSize}>Size: {item.size}</Text>
                    <Text style={styles.itemPrice}>₹{product.price}</Text>

                    {item.isDiscontinued ? (
                      <Text style={styles.discontinuedLabel}>Product Discontinued</Text>
                    ) : item.outOfStock ? (
                      <Text style={styles.outOfStockLabel}>Currently Out of Stock</Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.moveToBagButton,
                        item.outOfStock || item.isDiscontinued ? styles.disabledMoveButton : {}
                      ]}
                      onPress={() => handleMoveToBag(item)}
                      disabled={loadingAction === item._id || item.outOfStock || item.isDiscontinued}
                    >
                      {loadingAction === item._id ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.moveToBagText}>MOVE TO BAG</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer & Total - Only active items count */}
      {activeItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.priceSubtext}>excluding saved items</Text>
            </View>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, hasCheckoutBlockers ? styles.disabledCheckoutButton : {}]}
            onPress={() => {
              if (hasCheckoutBlockers) {
                if (hasPriceChanges) {
                  Alert.alert("Action Required", "Please accept the price updates before checkout.");
                } else {
                  Alert.alert("Checkout Blocked", "Please remove out-of-stock or discontinued items first.");
                }
                return;
              }
              router.push("/checkout");
            }}
            disabled={hasCheckoutBlockers}
          >
            <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
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
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
      marginTop: 2,
    },
    content: {
      flex: 1,
      padding: 12,
    },
    priceWarningBanner: {
      backgroundColor: "#fff0f2",
      borderWidth: 1,
      borderColor: "#ffccd4",
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
    },
    warningRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    warningIcon: {
      marginTop: 2,
      marginRight: 8,
    },
    warningText: {
      fontSize: 13,
      color: "#a6002c",
      flex: 1,
      lineHeight: 18,
    },
    acceptButton: {
      backgroundColor: "#ff3f6c",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
    },
    acceptButtonText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "bold",
    },
    blockerBanner: {
      backgroundColor: "#fff7eb",
      borderWidth: 1,
      borderColor: "#ffe0b2",
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    blockerText: {
      fontSize: 13,
      color: "#b26a00",
      flex: 1,
      lineHeight: 18,
    },
    emptyActiveState: {
      padding: 30,
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      borderStyle: "dashed",
    },
    emptyActiveText: {
      fontSize: 15,
      color: theme.textMuted,
      marginTop: 10,
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
    bagItem: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 10,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2.22,
      elevation: 3,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.border,
    },
    disabledItem: {
      opacity: 0.85,
      borderColor: "#ffccd4",
    },
    itemImage: {
      width: 105,
      height: 140,
      backgroundColor: "#f5f5f5",
    },
    itemInfo: {
      flex: 1,
      padding: 12,
      justifyContent: "space-between",
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    trashIcon: {
      padding: 4,
    },
    brandName: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    itemName: {
      fontSize: 13,
      color: theme.textSecondary,
      marginVertical: 2,
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    itemSize: {
      fontSize: 13,
      color: theme.textMuted,
    },
    bullet: {
      marginHorizontal: 6,
      color: theme.textPlaceholder,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
    },
    itemPrice: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.text,
    },
    priceDifference: {
      fontSize: 12,
      color: "#ff3f6c",
      marginLeft: 6,
      fontWeight: "500",
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      padding: 2,
      backgroundColor: theme.inputBackground,
    },
    quantityButton: {
      width: 26,
      height: 26,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    quantity: {
      paddingHorizontal: 12,
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
      minWidth: 32,
    },
    saveForLaterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    saveForLaterText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.primary,
    },
    savedSection: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 20,
    },
    savedHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    savedTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    savedItemCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 10,
    },
    savedItemImage: {
      width: 80,
      height: 105,
      borderRadius: 6,
      backgroundColor: "#f5f5f5",
    },
    savedItemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
    },
    discontinuedLabel: {
      fontSize: 11,
      color: "#ff3f6c",
      fontWeight: "bold",
      marginTop: 2,
    },
    outOfStockLabel: {
      fontSize: 11,
      color: "#ff9f00",
      fontWeight: "bold",
      marginTop: 2,
    },
    moveToBagButton: {
      backgroundColor: "#ff3f6c",
      paddingVertical: 6,
      borderRadius: 6,
      alignItems: "center",
      marginTop: 6,
    },
    disabledMoveButton: {
      backgroundColor: theme.border,
    },
    moveToBagText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "bold",
    },
    inStockBadge: {
      fontSize: 11,
      color: "#00b852",
      fontWeight: "bold",
    },
    lowStockBadge: {
      fontSize: 11,
      color: "#ff9f00",
      fontWeight: "bold",
    },
    outOfStockBadge: {
      fontSize: 11,
      color: "#ff3f6c",
      fontWeight: "bold",
    },
    discontinuedBadge: {
      fontSize: 11,
      color: "#a6002c",
      fontWeight: "bold",
    },
    footer: {
      padding: 15,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    totalLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    priceSubtext: {
      fontSize: 11,
      color: theme.textMuted,
      marginTop: 1,
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    checkoutButton: {
      backgroundColor: theme.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    disabledCheckoutButton: {
      backgroundColor: theme.border,
    },
    checkoutButtonText: {
      color: theme.primaryForeground,
      fontSize: 15,
      fontWeight: "bold",
    },
  });
