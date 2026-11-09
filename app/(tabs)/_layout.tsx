import { Tabs } from 'expo-router';
import { Shirt, Wand2, LayoutGrid } from 'lucide-react-native';

const PINK = '#FF69B4';
const GRAY = '#8E8E93';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: PINK,
        tabBarInactiveTintColor: GRAY,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: { backgroundColor: '#F9F7F4' },
        headerTintColor: '#1C1C1E',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          headerTitle: 'WTF — What The Fit',
          tabBarIcon: ({ focused }) => (
            <Shirt size={22} color={focused ? PINK : GRAY} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: 'Outfit Builder',
          tabBarIcon: ({ focused }) => (
            <Wand2 size={22} color={focused ? PINK : GRAY} strokeWidth={1.75} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: ({ focused }) => (
            <LayoutGrid size={22} color={focused ? PINK : GRAY} strokeWidth={1.75} />
          ),
        }}
      />
    </Tabs>
  );
}
