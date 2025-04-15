import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import NotificationBellIcon from '@/components/notifications/NotificationBellIcon';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          // Disable the swipe gesture to open the drawer
          swipeEnabled: false,
          headerRight: () => <NotificationBellIcon color="#000" />
        }}
      >
        <Drawer.Screen
          name="index" 
          options={{
            drawerLabel: 'Trang chủ',
            title: 'Trang chủ',
          }}
        />
        <Drawer.Screen
          name="profile" 
          options={{
            drawerLabel: 'Hồ sơ cá nhân',
            title: 'Hồ sơ cá nhân',
          }}
        />
        <Drawer.Screen
          name="podcasts"
          options={{
            drawerLabel: 'Podcasts',
            title: 'Podcasts',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
