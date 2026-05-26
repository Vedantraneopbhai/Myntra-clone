import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Receipt,
  RotateCcw,
} from "lucide-react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeColors } from "@/constants/Theme";
import { API_BASE_URL } from "@/constants/api";

const STATUS_FILTERS = ["All", "success", "pending", "failed", "refunded"];
const PAYMENT_FILTERS = ["All", "Card", "UPI", "Netbanking", "Wallet"];

export default function Transactions() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // List States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Sorting States
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sortField, setSortField] = useState<"createdAt" | "amount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch Transactions from API
  const fetchTransactions = useCallback(
    async (pageNum: number, isRefresh = false, showLoader = false) => {
      if (!user) return;

      try {
        if (showLoader) {
          if (pageNum === 1) setIsLoading(true);
          else setIsLoadingMore(true);
        }

        const params = {
          page: pageNum,
          limit: 15,
          sortField,
          sortOrder,
          status: statusFilter,
          paymentMode: paymentFilter,
        };

        const response = await axios.get(
          `${API_BASE_URL}/transactions/user/${user._id}`,
          { params }
        );

        const { transactions: fetchedData, pagination } = response.data;

        if (isRefresh || pageNum === 1) {
          setTransactions(fetchedData);
        } else {
          setTransactions((prev) => [...prev, ...fetchedData]);
        }

        setPage(pagination.page);
        setTotalPages(pagination.totalPages);
        setTotalRecords(pagination.total);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        Alert.alert("Error", "Failed to fetch transaction history.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [user, statusFilter, paymentFilter, sortField, sortOrder]
  );

  // Trigger initial fetch and reload on filter/sort change
  useEffect(() => {
    fetchTransactions(1, true, true);
  }, [statusFilter, paymentFilter, sortField, sortOrder]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(1, true, false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && page < totalPages) {
      fetchTransactions(page + 1, false, true);
    }
  };

  // Toggle Sorting helper
  const handleSort = (field: "createdAt" | "amount") => {
    if (sortField === field) {
      // Toggle order if clicking same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc for new field
    }
  };

  // Single CSV Export trigger
  const handleExportCSV = async () => {
    if (!user) return;
    const filterQuery = `status=${statusFilter}&paymentMode=${paymentFilter}`;
    const exportUrl = `${API_BASE_URL}/transactions/export/csv/${user._id}?${filterQuery}`;
    try {
      await WebBrowser.openBrowserAsync(exportUrl);
    } catch (err) {
      Alert.alert("Export Failed", "Unable to download transactions history.");
    }
  };

  // Open PDF Invoice
  const handleViewReceipt = async (transactionId: string) => {
    const receiptUrl = `${API_BASE_URL}/transactions/${transactionId}/receipt`;
    try {
      await WebBrowser.openBrowserAsync(receiptUrl);
    } catch (err) {
      Alert.alert("Error", "Unable to display PDF receipt.");
    }
  };

  // Request refund logic
  const handleRequestRefund = (transaction: any) => {
    Alert.alert(
      "Refund Request",
      `Are you sure you want to request a refund of ₹${transaction.amount} for invoice ${transaction.invoiceId}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select Reason",
          onPress: () => {
            Alert.alert(
              "Select Reason",
              "Choose a reason for your refund request:",
              [
                { text: "Late Delivery", onPress: () => processRefund(transaction._id, "Late Delivery") },
                { text: "Wrong Size / Fit", onPress: () => processRefund(transaction._id, "Wrong Size / Fit") },
                { text: "Defective Product", onPress: () => processRefund(transaction._id, "Defective Product") },
                { text: "Don't Want Anymore", onPress: () => processRefund(transaction._id, "Don't Want Anymore") },
                { text: "Cancel", style: "cancel" },
              ]
            );
          },
        },
      ]
    );
  };

  const processRefund = async (transactionId: string, reason: string) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/transactions/refund`, {
        transactionId,
        userId: user._id,
        reason,
      });

      if (response.data.success) {
        Alert.alert("Success", "Refund successfully initiated.");
        // Instantly update local state to reflect refund status
        setTransactions((prev) =>
          prev.map((t) =>
            t._id === transactionId ? { ...t, status: "refunded" } : t
          )
        );
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to process refund.";
      Alert.alert("Refund Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all filters utility
  const handleResetFilters = () => {
    setStatusFilter("All");
    setPaymentFilter("All");
    setSortField("createdAt");
    setSortOrder("desc");
  };

  // Render dynamic status badge
  const renderStatusBadge = (status: string) => {
    let bg, color, Icon;
    switch (status) {
      case "success":
        bg = theme.primaryLight; // customized tint
        color = "#00b852";
        Icon = CheckCircle;
        break;
      case "failed":
        bg = "#fde8e8";
        color = "#e02424";
        Icon = XCircle;
        break;
      case "pending":
        bg = "#fef3c7";
        color = "#d97706";
        Icon = AlertCircle;
        break;
      case "refunded":
        bg = "#eef2f6";
        color = "#4b5563";
        Icon = RotateCcw;
        break;
      default:
        bg = theme.border;
        color = theme.textMuted;
        Icon = AlertCircle;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Icon size={12} color={color} style={{ marginRight: 4 }} />
        <Text style={[styles.statusBadgeText, { color }]}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Render Transaction Card Item
  const renderTransactionItem = ({ item }: { item: any }) => {
    const isSuccess = item.status === "success";

    return (
      <View style={styles.transactionCard}>
        {/* Card Top Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.invoiceText}>{item.invoiceId}</Text>
            <View style={styles.dateRow}>
              <Calendar size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        {/* Card Body details */}
        <View style={styles.cardBody}>
          <View style={styles.bodyDetailCol}>
            <View style={styles.detailLabelRow}>
              <CreditCard size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.detailLabel}>Payment Mode</Text>
            </View>
            <Text style={styles.detailVal}>{item.paymentMode}</Text>
          </View>

          <View style={styles.bodyDetailCol}>
            <Text style={styles.detailLabel}>Gateway ID</Text>
            <Text style={styles.detailVal} numberOfLines={1} ellipsizeMode="tail">
              {item.paymentGatewayTransactionId || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Card Footer Actions & Amount */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{item.amount.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.actionsContainer}>
            {isSuccess && (
              <TouchableOpacity
                style={styles.refundButton}
                onPress={() => handleRequestRefund(item)}
              >
                <RotateCcw size={15} color={theme.primary} style={{ marginRight: 4 }} />
                <Text style={styles.refundButtonText}>Refund</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => handleViewReceipt(item._id)}
            >
              <FileText size={15} color={theme.textInverse} style={{ marginRight: 4 }} />
              <Text style={styles.receiptButtonText}>Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Login check Empty State fallback
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Transactions</Text>
        </View>
        <View style={styles.centerContainer}>
          <Receipt size={64} color={theme.primary} />
          <Text style={styles.emptyTitle}>Please log in to view transactions</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/login")}>
            <Text style={styles.actionBtnText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={theme.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Transactions</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
          <Download size={18} color={theme.primary} />
          <Text style={styles.exportBtnText}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* ── FILTER SECTION ── */}
      <View style={styles.filterSection}>
        {/* Status filters scrollbar */}
        <View style={styles.filterRow}>
          <Text style={styles.filterTitle}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterCapsule, active && styles.filterCapsuleActive]}
                  onPress={() => setStatusFilter(s)}
                >
                  <Text style={[styles.filterCapsuleText, active && styles.filterCapsuleTextActive]}>
                    {s === "All" ? "All" : s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment mode filters scrollbar */}
        <View style={styles.filterRow}>
          <Text style={styles.filterTitle}>Payment:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {PAYMENT_FILTERS.map((p) => {
              const active = paymentFilter === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.filterCapsule, active && styles.filterCapsuleActive]}
                  onPress={() => setPaymentFilter(p)}
                >
                  <Text style={[styles.filterCapsuleText, active && styles.filterCapsuleTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── SORT BAR & META SUMMARY ── */}
      <View style={styles.sortBar}>
        <Text style={styles.summaryText}>{totalRecords.toLocaleString("en-IN")} transactions</Text>
        <View style={styles.sortActions}>
          <TouchableOpacity
            style={[styles.sortButton, sortField === "createdAt" && styles.sortButtonActive]}
            onPress={() => handleSort("createdAt")}
          >
            <Text style={[styles.sortButtonText, sortField === "createdAt" && styles.sortButtonTextActive]}>Date</Text>
            {sortField === "createdAt" && (
              sortOrder === "asc" ? <ChevronUp size={14} color={theme.primary} /> : <ChevronDown size={14} color={theme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortField === "amount" && styles.sortButtonActive]}
            onPress={() => handleSort("amount")}
          >
            <Text style={[styles.sortButtonText, sortField === "amount" && styles.sortButtonTextActive]}>Amount</Text>
            {sortField === "amount" && (
              sortOrder === "asc" ? <ChevronUp size={14} color={theme.primary} /> : <ChevronDown size={14} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MAIN TRANSACTION LIST ── */}
      {isLoading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.metaText, { marginTop: 10 }]}>Loading records...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Receipt size={48} color={theme.textPlaceholder} />
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>Try tweaking your status or payment mode filters.</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      )}
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      paddingTop: 50,
      paddingBottom: 15,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    backBtn: {
      marginRight: 15,
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    exportBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.primary + "30",
    },
    exportBtnText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.primary,
      marginLeft: 4,
    },
    filterSection: {
      backgroundColor: theme.surface,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 15,
      marginVertical: 4,
    },
    filterTitle: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.textMuted,
      width: 55,
    },
    filterScroll: {
      paddingRight: 10,
    },
    filterCapsule: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.inputBackground,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterCapsuleActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    filterCapsuleText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    filterCapsuleTextActive: {
      color: theme.primaryForeground,
    },
    sortBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    summaryText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textMuted,
    },
    sortActions: {
      flexDirection: "row",
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    sortButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    sortButtonText: {
      fontSize: 11,
      color: theme.textSecondary,
      marginRight: 4,
      fontWeight: "500",
    },
    sortButtonTextActive: {
      color: theme.primary,
      fontWeight: "bold",
    },
    listContent: {
      padding: 15,
      paddingBottom: 40,
    },
    transactionCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    invoiceText: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 3,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateText: {
      fontSize: 11,
      color: theme.textMuted,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusBadgeText: {
      fontSize: 9,
      fontWeight: "bold",
    },
    cardBody: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
    },
    bodyDetailCol: {
      flex: 1,
      marginRight: 10,
    },
    detailLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 4,
    },
    detailVal: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSecondary,
    },
    cardDivider: {
      height: 1,
      backgroundColor: theme.borderLight,
      marginVertical: 12,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    amountLabel: {
      fontSize: 11,
      color: theme.textMuted,
      marginBottom: 2,
    },
    amountValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
    },
    actionsContainer: {
      flexDirection: "row",
    },
    refundButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      marginRight: 8,
      backgroundColor: theme.surface,
    },
    refundButtonText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: "bold",
    },
    receiptButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.text,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    receiptButtonText: {
      fontSize: 12,
      color: theme.background,
      fontWeight: "bold",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
    },
    emptyTitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 20,
      marginBottom: 20,
      fontWeight: "600",
    },
    actionBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 8,
    },
    actionBtnText: {
      color: theme.primaryForeground,
      fontSize: 14,
      fontWeight: "bold",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textSecondary,
      marginTop: 15,
      marginBottom: 6,
    },
    emptySubtext: {
      fontSize: 12,
      color: theme.textMuted,
      textAlign: "center",
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    resetBtn: {
      backgroundColor: theme.inputBackground,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    resetBtnText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: "bold",
    },
    footerLoader: {
      paddingVertical: 15,
      alignItems: "center",
    },
    metaText: {
      fontSize: 12,
      color: theme.textMuted,
    },
  });
