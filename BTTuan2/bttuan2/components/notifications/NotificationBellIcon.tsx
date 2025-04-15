import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/context/NotificationContext';

interface NotificationBellIconProps {
    size?: number;
    color?: string;
    iconName?: keyof typeof Ionicons.glyphMap; // Allow customization
}

const NotificationBellIcon: React.FC<NotificationBellIconProps> = ({ 
    size = 26, 
    color = 'black', 
    iconName = 'notifications-outline' 
}) => {
    const router = useRouter();
    const { unreadCount } = useNotifications();

    const handlePressIn = () => {
        console.log("NotificationBellIcon - onPressIn detected!");
        try {
            router.push('/(tabs)/notifications'); 
            console.log("Navigation attempted to /(tabs)/notifications");
       } catch (e) {
            console.error("Navigation failed:", e);
            Alert.alert("Navigation Error", "Could not open notifications screen.");
       }
    }

    const handlePress = () => {
        console.log("NotificationBellIcon - onPress called!");
        console.log("NotificationBellIcon - unreadCount:", unreadCount);
        router.push('/(tabs)/notifications');
        // Navigate to the notifications screen (adjust path based on your router setup)
        try {
             router.push('/(tabs)/notifications'); 
             console.log("Navigation attempted to /(tabs)/notifications");
        } catch (e) {
             console.error("Navigation failed:", e);
             Alert.alert("Navigation Error", "Could not open notifications screen.");
        }
    };

    return (
        <TouchableOpacity 
            onPress={handlePress} 
            onPressIn={handlePressIn}
            style={styles.container}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name={iconName} size={size} color={color} />
            {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 5, // Add some padding for easier pressing
        position: 'relative', // Needed for absolute positioning of the badge
        marginRight: 10, // Add some margin if used in header
    },
    badgeContainer: {
        position: 'absolute',
        right: -2,
        top: -1,
        backgroundColor: 'red',
        borderRadius: 9, // Make it circular
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white', // Optional border
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default NotificationBellIcon; 