import { useEffect, useMemo, useState } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package, ChevronRight, MapPin, Truck, CreditCard,
} from "lucide-react-native";
import React from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";

import { getProductImageUrl } from "@/utils/imageUtils";

export default function Orders() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [orders, setorder] = useState<any>(null);

  useEffect(() => {
    const fetchorder = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("orders")
            .select("*, items:order_items(*, productId:products(*))")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          
          const mappedOrders = data?.map(o => ({
            ...o,
            _id: o.id,
            date: new Date(o.created_at).toLocaleDateString(),
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            items: o.items?.map((i: any) => ({ ...i, _id: i.id })) || []
          })) || [];
          
          setorder(mappedOrders);
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
      } else { setIsLoading(false); }
    };
    fetchorder();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!orders) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      <ScrollView style={styles.content}>
        {orders.map((order: any) => (
          <View key={order._id} style={styles.orderCard}>
            <TouchableOpacity style={styles.orderHeader} onPress={() => toggleOrderDetails(order._id)}>
              <View>
                <Text style={styles.orderId}>Order #{order._id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Package size={16} color="#00b852" />
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.itemsContainer}>
              {order.items.map((item: any) => (
                <View key={item._id} style={styles.orderItem}>
                  <Image source={{ uri: getProductImageUrl(item.productId?.images, item.productId?.category, item.productId?._id) }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.brandName}>{item.productId?.brand || "Brand"}</Text>
                    <Text style={styles.itemName}>{item.productId?.name || "Product Name"}</Text>
                    <Text style={styles.itemPrice}>₹{item.productId?.price ?? 0}</Text>
                  </View>
                </View>
              ))}
            </View>

            {expandedOrder === order._id && (
              <View style={styles.orderDetails}>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <MapPin size={20} color={theme.icon} />
                    <Text style={styles.detailTitle}>Shipping Address</Text>
                  </View>
                  <Text style={styles.detailText}>{order.shippingAddress}</Text>
                </View>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <CreditCard size={20} color={theme.icon} />
                    <Text style={styles.detailTitle}>Payment Method</Text>
                  </View>
                  <Text style={styles.detailText}>{order.paymentMethod}</Text>
                </View>
                <View style={styles.detailSection}>
                  <View style={styles.detailHeader}>
                    <Truck size={20} color={theme.icon} />
                    <Text style={styles.detailTitle}>Tracking Information</Text>
                  </View>
                  <View style={styles.trackingInfo}>
                    <Text style={styles.trackingNumber}>Tracking Number: {order.tracking?.number}</Text>
                    <Text style={styles.trackingCarrier}>Carrier: {order.tracking?.carrier}</Text>
                  </View>
                  <View style={styles.timeline}>
                    {order.tracking?.timeline?.map((event: any, index: any) => (
                      <View key={index} style={styles.timelineEvent}>
                        <View style={styles.timelinePoint} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineStatus}>{event.status}</Text>
                          <Text style={styles.timelineLocation}>{event.location}</Text>
                          <Text style={styles.timelineTimestamp}>{event.timestamp}</Text>
                        </View>
                        {index !== order.tracking.timeline.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.orderFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Order Total</Text>
                <Text style={styles.totalAmount}>₹{order.total}</Text>
              </View>
              <TouchableOpacity style={styles.detailsButton} onPress={() => toggleOrderDetails(order._id)}>
                <Text style={styles.detailsButtonText}>
                  {expandedOrder === order._id ? "Hide Details" : "View Details"}
                </Text>
                <ChevronRight size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
  notFoundText: { color: theme.text, textAlign: "center", marginTop: 40 },
  header: { padding: 15, paddingTop: 50, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: theme.text },
  content: { flex: 1, padding: 15 },
  orderCard: {
    backgroundColor: theme.surface, borderRadius: 10, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5, overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 15, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  orderId: { fontSize: 16, fontWeight: "bold", color: theme.text },
  orderDate: { fontSize: 14, color: theme.textMuted, marginTop: 2 },
  statusContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#e6f4ea",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
  },
  orderStatus: { fontSize: 14, color: "#00b852", marginLeft: 5 },
  itemsContainer: { padding: 15 },
  orderItem: { flexDirection: "row", marginBottom: 15 },
  itemImage: { width: 80, height: 100, borderRadius: 5 },
  itemInfo: { flex: 1, marginLeft: 15 },
  brandName: { fontSize: 14, color: theme.textMuted, marginBottom: 2 },
  itemName: { fontSize: 16, color: theme.textSecondary, marginBottom: 2 },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: theme.text },
  orderDetails: { padding: 15, borderTopWidth: 1, borderTopColor: theme.border },
  detailSection: { marginBottom: 20 },
  detailHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  detailTitle: { fontSize: 16, fontWeight: "bold", color: theme.text, marginLeft: 10 },
  detailText: { fontSize: 14, color: theme.textMuted, lineHeight: 20 },
  trackingInfo: { marginBottom: 15 },
  trackingNumber: { fontSize: 14, color: theme.textMuted, marginBottom: 5 },
  trackingCarrier: { fontSize: 14, color: theme.textMuted },
  timeline: { marginTop: 15 },
  timelineEvent: { flexDirection: "row", marginBottom: 20, position: "relative" },
  timelinePoint: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.primary, marginTop: 5 },
  timelineLine: { position: "absolute", left: 5, top: 17, width: 2, height: "100%", backgroundColor: theme.border },
  timelineContent: { marginLeft: 15, flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: "bold", color: theme.text, marginBottom: 2 },
  timelineLocation: { fontSize: 14, color: theme.textMuted, marginBottom: 2 },
  timelineTimestamp: { fontSize: 12, color: theme.textPlaceholder },
  orderFooter: { padding: 15, borderTopWidth: 1, borderTopColor: theme.border },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  totalLabel: { fontSize: 16, color: theme.textMuted },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: theme.text },
  detailsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  detailsButtonText: { fontSize: 16, color: theme.primary, marginRight: 5 },
});
