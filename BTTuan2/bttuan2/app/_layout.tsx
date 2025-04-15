import { Stack } from "expo-router";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationBellIcon from "@/components/notifications/NotificationBellIcon";
import React from "react";

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(podcast)/[id]" options={{ 
          headerShown: true,
          title: 'Podcast Detail',
          headerBackTitle: 'Back',
          headerRight: () => <NotificationBellIcon color="#000" />
        }} />
        <Stack.Screen name="(edit-email)/index" options={{ title: 'Edit Email',
          headerRight: () => <NotificationBellIcon color="#000" />
         }} />
        <Stack.Screen name="(edit-password)/index" options={{ title: 'Edit Password',
          headerRight: () => <NotificationBellIcon color="#000" />
         }} />
        <Stack.Screen name="(edit-profile)/index" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="(history)/index" options={{ title: 'History' }} />
        <Stack.Screen name="(like-podcast)/index" options={{ title: 'Liked Podcasts' }} />
        <Stack.Screen name="(privacy-policy)/index" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="(term-of-service)/index" options={{ title: 'Terms of Service' }} />
      </Stack>
    </NotificationProvider>
  );
}
