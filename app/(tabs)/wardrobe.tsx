import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import CategoryTabs from '../../components/CategoryTabs';
import ClothingCard from '../../components/ClothingCard';
import { ClothingItem, Category, getClothingByCategory, deleteClothingItem } from '../../db/clothing';

export default function WardrobeScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('top');
  const [items, setItems] = useState<ClothingItem[]>([]);

  const loadItems = useCallback(async () => {
    const data = await getClothingByCategory(category);
    setItems(data);
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleLongPress = (item: ClothingItem) => {
    Alert.alert(
      item.label ?? 'Clothing Item',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () =>
            router.push({
              pathname: '/add-item',
              params: { category, itemId: String(item.id) },
            }),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteClothingItem(item.id);
            loadItems();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CategoryTabs active={category} onChange={setCategory} />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            {category === 'top' ? '👚' : category === 'bottom' ? '👖' : '👟'}
          </Text>
          <Text style={styles.emptyTitle}>No {category}s yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first item
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ClothingCard
              item={item}
              onLongPress={() => handleLongPress(item)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-item', params: { category } })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
    paddingTop: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    marginTop: -1,
  },
});
