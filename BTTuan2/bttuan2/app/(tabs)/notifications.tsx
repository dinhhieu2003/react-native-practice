import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useNotifications } from '@/context/NotificationContext';
import * as api from '@/api/api';
import { NotificationItem as Notification } from '@/utils/types/type'; // Use re-exported type
import NotificationItemComponent from '@/components/notifications/NotificationItem'; // Import the component

// --- Notifications Screen Component ---

export default function NotificationsScreen() {
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        currentPage,
        totalPages,
        pageSize,
        setNotifications: setContextNotifications,
        markAllAsRead: markContextAllAsRead,
        setLoading: setContextLoading,
        setError: setContextError,
    } = useNotifications();

    // Local loading state specifically for pagination to show footer indicator
    const [isPaginating, setIsPaginating] = useState(false);

    const loadNotifications = useCallback(async (pageNum: number) => {
        console.log(`Loading notifications page: ${pageNum}, Current total: ${totalPages}`);
        if (pageNum > 1 && isLoading) return; // Prevent multiple concurrent loads
        if (pageNum > 1 && pageNum > totalPages && totalPages !== 0) {
             console.log('Reached end of notifications.');
             return; // Don't fetch if we know we're past the last page
        }

        setContextLoading(true);
        if (pageNum > 1) setIsPaginating(true);
        setContextError(null);

        try {
            const response = await api.WorkspaceNotifications(pageNum, pageSize);
            if (response?.data) {
                const { result, meta } = response.data;
                console.log('API Response Meta:', meta);

                setContextNotifications(
                     pageNum === 1 ? result : [...notifications, ...result], // Replace on page 1, append otherwise
                    meta.totalItems,
                    meta.totalPages,
                    meta.current, // Use current page from API response
                    meta.pageSize
                );
            } else {
                 throw new Error(response?.message || 'Failed to fetch notifications: No data returned');
            }
        } catch (err: any) {
            console.error("Error loading notifications:", err);
            const errorMessage = err.message || 'An unknown error occurred';
            setContextError(errorMessage);
            // Alert.alert("Error", errorMessage);
        } finally {
            setContextLoading(false);
            setIsPaginating(false);
        }
    }, [isLoading, totalPages, pageSize, setContextLoading, setContextError, setContextNotifications, notifications]);

    // Initial Load
    useEffect(() => {
        console.log('NotificationsScreen mounted, loading initial data...');
        loadNotifications(1);
    }, []); // Use empty dependency array for initial mount only

    const handleMarkAllRead = async () => {
        console.log('handleMarkAllRead: unreadCount:', unreadCount, 'isLoading:', isLoading);
        if (unreadCount === 0) return;

        Alert.alert(
            "Mark All Read?",
            "Are you sure you want to mark all notifications as read?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK", onPress: async () => { // Make onPress async
                        const success = await markContextAllAsRead(); // Await the context action
                        if (success) {
                            console.log('Mark all read successful, refreshing list...');
                            loadNotifications(1); // Reload list from backend on success
                        } else {
                            // Error is handled and displayed by the context
                            console.log('Mark all read failed (handled by context).');
                        }
                    }
                }
            ]
        );
    };

    const handleEndReached = () => {
        console.log(`End reached. Current: ${currentPage}, Total: ${totalPages}, Loading: ${isLoading}, Paginating: ${isPaginating}`);
        // Check isLoading and isPaginating to prevent multiple triggers
        if (!isLoading && !isPaginating && currentPage < totalPages) {
            loadNotifications(currentPage + 1);
        } else if (currentPage >= totalPages) {
             console.log('handleEndReached: Already on last page or beyond.');
        }
    };

    const renderFooter = () => {
        if (!isPaginating) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" />;
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Notifications',
                    headerRight: () => (
                        <TouchableOpacity onPressIn={handleMarkAllRead}>
                            <Text style={[styles.headerButton]}>
                                Mark All Read
                            </Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            {isLoading && notifications.length === 0 && (
                <ActivityIndicator style={styles.centered} size="large" />
            )}

            {error && notifications.length === 0 && (
                <View style={styles.centered}><Text style={styles.errorText}>Error: {error}</Text></View>
            )}

            {notifications.length === 0 && !isLoading && !error && (
                 <View style={styles.centered}><Text>No notifications yet.</Text></View>
            )}

            {notifications.length > 0 && (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => <NotificationItemComponent item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.listContentContainer}
                />
            )}
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
    },
    listContentContainer: {
        paddingVertical: 8,
    },
    headerButton: {
        color: '#007bff',
        marginRight: 15,
        fontSize: 16,
    },
    headerButtonDisabled: {
        color: '#cccccc',
    },
}); 