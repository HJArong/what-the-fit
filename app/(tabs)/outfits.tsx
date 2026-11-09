import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useState } from 'react';
import { OutfitWithItems, getAllOutfits } from '../../db/outfits';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

function OutfitCard({ outfit, onPress }: { outfit: OutfitWithItems; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Top */}
      <View style={styles.topSlot}>
        {outfit.top ? (
          <Image source={{ uri: outfit.top.image_uri }} style={styles.slotImage} resizeMode="contain" />
        ) : (
          <View style={styles.emptySlot} />
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom */}
      <View style={styles.bottomSlot}>
        {outfit.bottom ? (
          <Image source={{ uri: outfit.bottom.image_uri }} style={styles.slotImage} resizeMode="contain" />
        ) : (
          <View style={styles.emptySlot} />
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Shoes */}
      <View style={styles.shoesSlot}>
        {outfit.shoes ? (
          <Image source={{ uri: outfit.shoes.image_uri }} style={styles.slotImage} resizeMode="contain" />
        ) : (
          <View style={styles.emptySlot} />
        )}
      </View>

      {/* Name footer */}
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {outfit.name ?? 'Untitled'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OutfitsScreen() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllOutfits().then(setOutfits);
    }, [])
  );

  if (outfits.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No saved outfits yet</Text>
        <Text style={styles.emptySubtitle}>
          Head to the Builder tab to create your first look
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            onPress={() =>
              router.push({ pathname: '/outfit-detail', params: { id: item.id } })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F1EF',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  topSlot: {
    height: CARD_WIDTH * 0.72,
    backgroundColor: '#FFFFFF',
  },
  bottomSlot: {
    height: CARD_WIDTH * 0.8,
    backgroundColor: '#FFFFFF',
  },
  shoesSlot: {
    height: CARD_WIDTH * 0.48,
    backgroundColor: '#FFFFFF',
  },

  slotImage: {
    width: '100%',
    height: '100%',
  },
  emptySlot: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0EFED',
  },

  footer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0EFED',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F1EF',
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
