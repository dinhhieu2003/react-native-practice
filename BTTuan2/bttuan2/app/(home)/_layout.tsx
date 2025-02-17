import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
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
      </Drawer>
    </GestureHandlerRootView>
  );
}
