import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';
import * as api from '@/api/api';
import { NotificationItem as Notification } from '@/utils/types/type';
import { PodcastDetail, ElementType } from '@/utils/types/type'; // Import needed types for navigation

interface NotificationItemProps {
    item: Notification;
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({ item }) => {
    const router = useRouter();
    const {
        markAsRead: markContextAsRead, // Get the context action
        setError: setContextError, // To report errors
    } = useNotifications();

    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

    const handlePress = async () => {
        console.log('Handling press for notification:', item.id, 'Type:', item.type);

        // --- 1. Mark as Read (Context handles API call now) ---
        if (!item.read) {
            markContextAsRead(item.id); // Just call the context action
        }

        // --- 2. Navigation --- 
        try {
            console.log(`Attempting navigation for type: ${item.type}, relatedId: ${item.relatedId}`);
            switch (item.type) {
                case 'NEW_PODCAST':
                case 'COMMENT_LIKE_PODCAST':
                    // Fetch Podcast details before navigating
                    const podcastResponse = await api.getPodcastById(item.relatedId);
                    if (podcastResponse?.data) {
                        const podcast: PodcastDetail = podcastResponse.data;
                        console.log(`Navigating to podcast: ${podcast.id} - ${podcast.title}`);
                        // Use the literal pathname for the dynamic route
                        router.push({
                            pathname: '/(podcast)/[id]', // Literal path for typed routes
                            params: { 
                                id: podcast.id, // Pass ID as a param
                                title: podcast.title,
                                audioUrl: podcast.audioUrl,
                                transcript: podcast.transcript || '',
                                element: podcast.element,
                                active: podcast.active ? 'true' : 'false'
                            }
                        });
                    } else {
                         throw new Error(`Podcast with ID ${item.relatedId} not found.`);
                    }
                    break;

                case 'COMMENT_LIKE_ELEMENT':
                     // Assuming element route might be dynamic like /elements/[symbol]
                     // Or if it's based on ID, adjust accordingly
                    console.log(`Navigating to element: ${item.relatedId}`); // Assuming relatedId is element symbol or ID
                    // Adjust the path based on your actual element route structure
                    router.push(`/(element)/${item.relatedId}`); 
                    break;

                default:
                    console.warn('Unknown notification type, cannot navigate:', item.type);
                    Alert.alert("Navigation Error", "Cannot determine where to navigate for this notification type.");
            }
        } catch (navigationError: any) {
            console.error('Navigation Error:', navigationError);
            setContextError(`Navigation failed: ${navigationError.message}`);
            Alert.alert("Navigation Error", `Could not navigate: ${navigationError.message}`);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.itemContainer, !item.read && styles.itemUnread]}
            onPressIn={handlePress}
        >
            <View style={styles.itemContent}>
                 {/* TODO: Add an icon based on item.type */}
                <Text style={styles.itemTitle}>{item.message}</Text>
                <Text style={styles.itemTimestamp}>{timeAgo}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};

// --- Styles (Copied from notifications.tsx for consistency) ---
const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 4,
        marginHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    itemUnread: {
        backgroundColor: '#eef7ff', // Slightly different background for unread
        borderColor: '#cce5ff',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500', // Slightly less bold than screen title
        marginBottom: 4,
        color: '#333',
    },
    itemTimestamp: {
        fontSize: 12,
        color: '#666',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#007bff', // Blue dot for unread
        marginLeft: 10,
    },
});

export default NotificationItemComponent; 