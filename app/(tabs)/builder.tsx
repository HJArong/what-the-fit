import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import ItemPicker from '../../components/ItemPicker';
import { ClothingItem, getClothingByCategory } from '../../db/clothing';
import { saveOutfit } from '../../db/outfits';

export default function BuilderScreen() {
  const [tops, setTops] = useState<ClothingItem[]>([]);
  const [bottoms, setBottoms] = useState<ClothingItem[]>([]);
  const [shoes, setShoes] = useState<ClothingItem[]>([]);

  const [selectedTop, setSelectedTop] = useState<ClothingItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<ClothingItem | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<ClothingItem | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    const [t, b, s] = await Promise.all([
      getClothingByCategory('top'),
      getClothingByCategory('bottom'),
      getClothingByCategory('shoes'),
    ]);
    setTops(t);
    setBottoms(b);
    setShoes(s);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const hasSelection = selectedTop || selectedBottom || selectedShoes;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveOutfit(
        selectedTop?.id ?? null,
        selectedBottom?.id ?? null,
        selectedShoes?.id ?? null,
        outfitName.trim() || undefined
      );
      setShowSaveModal(false);
      setOutfitName('');
      setSelectedTop(null);
      setSelectedBottom(null);
      setSelectedShoes(null);
      Alert.alert('Saved!', 'Your outfit has been saved.');
    } catch {
      Alert.alert('Error', 'Could not save outfit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ItemPicker
        label="Top"
        category="top"
        items={tops}
        selectedId={selectedTop?.id ?? null}
        onSelect={(item) => setSelectedTop(item)}
        style={styles.topSection}
      />
      <ItemPicker
        label="Bottom"
        category="bottom"
        items={bottoms}
        selectedId={selectedBottom?.id ?? null}
        onSelect={(item) => setSelectedBottom(item)}
        style={styles.bottomSection}
      />
      <ItemPicker
        label="Shoes"
        category="shoes"
        items={shoes}
        selectedId={selectedShoes?.id ?? null}
        onSelect={(item) => setSelectedShoes(item)}
        style={styles.shoesSection}
      />

      <View style={styles.footer}>
        {hasSelection && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => setShowSaveModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save Outfit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name your outfit</Text>
            <Text style={styles.modalSubtitle}>Optional — leave blank to save without a name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Office Monday, Casual Friday…"
              placeholderTextColor="#C7C7CC"
              value={outfitName}
              onChangeText={setOutfitName}
              maxLength={40}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowSaveModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 5,
  },
  bottomSection: {
    flex: 5,
  },
  shoesSection: {
    flex: 3,
    borderBottomWidth: 0,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#FF69B4',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalSave: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
