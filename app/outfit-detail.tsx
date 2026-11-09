import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { OutfitWithItems, getOutfitById, deleteOutfit } from '../db/outfits';
import { ClothingItem } from '../db/clothing';

function ItemRow({ item, label, emoji }: { item: ClothingItem | null; label: string; emoji: string }) {
  return (
    <View style={styles.itemRow}>
      {item ? (
        <Image source={{ uri: item.image_uri }} style={styles.itemImage} resizeMode="cover" />
      ) : (
        <View style={[styles.itemImage, styles.itemImageEmpty]}>
          <Text style={{ fontSize: 28, opacity: 0.35 }}>{emoji}</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemCategory}>{label}</Text>
        <Text style={styles.itemLabel}>{item?.label ?? '—'}</Text>
        {item?.color ? (
          <Text style={styles.itemColor}>{item.color}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [outfit, setOutfit] = useState<OutfitWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOutfitById(Number(id)).then((data) => {
      setOutfit(data);
      setLoading(false);
      if (data) {
        navigation.setOptions({ title: data.name ?? 'Outfit' });
      }
    });
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Outfit', 'Are you sure you want to delete this outfit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteOutfit(Number(id));
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#8E8E93' }}>Outfit not found.</Text>
      </View>
    );
  }

  const date = new Date(outfit.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{date}</Text>

      <ItemRow item={outfit.top} label="Top" emoji="👚" />
      <ItemRow item={outfit.bottom} label="Bottom" emoji="👖" />
      <ItemRow item={outfit.shoes} label="Shoes" emoji="👟" />

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
        <Text style={styles.deleteBtnText}>Delete Outfit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  date: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 24,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9F7F4',
    borderRadius: 14,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 120,
  },
  itemImageEmpty: {
    backgroundColor: '#F0EFED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  itemColor: {
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
});
