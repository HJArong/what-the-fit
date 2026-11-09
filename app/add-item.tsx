import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Category, addClothingItem, getClothingById, updateClothingItem } from '../db/clothing';

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: 'top', label: 'Top', emoji: '👚' },
  { key: 'bottom', label: 'Bottom', emoji: '👖' },
  { key: 'shoes', label: 'Shoes', emoji: '👟' },
];

const COLORS = [
  { label: 'Black', value: 'black', hex: '#1C1C1E' },
  { label: 'White', value: 'white', hex: '#F5F5F5' },
  { label: 'Grey', value: 'grey', hex: '#8E8E93' },
  { label: 'Navy', value: 'navy', hex: '#1A3A5C' },
  { label: 'Blue', value: 'blue', hex: '#3478F6' },
  { label: 'Green', value: 'green', hex: '#34C759' },
  { label: 'Red', value: 'red', hex: '#FF3B30' },
  { label: 'Pink', value: 'pink', hex: '#FF6B9D' },
  { label: 'Yellow', value: 'yellow', hex: '#FFD60A' },
  { label: 'Brown', value: 'brown', hex: '#8B6F47' },
  { label: 'Beige', value: 'beige', hex: '#D4C5A9' },
  { label: 'Purple', value: 'purple', hex: '#AF52DE' },
];

const CATEGORY_LABELS: Record<Category, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
};

export default function AddItemScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ category?: Category; itemId?: string }>();
  const lockedCategory = params.category ?? null;
  const editItemId = params.itemId ? parseInt(params.itemId, 10) : null;
  const isEditing = editItemId !== null;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUri, setOriginalImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>(lockedCategory ?? 'top');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Set header title
  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({
        title: lockedCategory ? `Edit ${CATEGORY_LABELS[lockedCategory]}` : 'Edit Item',
      });
    } else {
      navigation.setOptions({
        title: lockedCategory ? `Add ${CATEGORY_LABELS[lockedCategory]}` : 'Add Clothing',
      });
    }
  }, [lockedCategory, isEditing, navigation]);

  // Load existing item when editing
  useEffect(() => {
    if (!editItemId) return;
    getClothingById(editItemId).then((item) => {
      if (!item) return;
      setImageUri(item.image_uri);
      setOriginalImageUri(item.image_uri);
      setCategory(item.category);
      setLabel(item.label ?? '');
      setColor(item.color ?? null);
    });
  }, [editItemId]);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!imageUri) {
      Alert.alert('No photo', 'Please add a photo first.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && editItemId !== null) {
        const imageChanged = imageUri !== originalImageUri;
        await updateClothingItem(
          editItemId,
          label.trim() || null,
          color,
          imageChanged ? imageUri : undefined
        );
      } else {
        await addClothingItem(imageUri, category, label.trim() || undefined, color ?? undefined);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <View style={styles.photoSection}>
          {imageUri ? (
            <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.9}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <View style={styles.changePhotoOverlay}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderTitle}>Add a photo</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={pickFromCamera} activeOpacity={0.8}>
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, styles.photoBtnOutline]} onPress={pickFromGallery} activeOpacity={0.8}>
                  <Text style={[styles.photoBtnText, styles.photoBtnOutlineText]}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Category — hidden when a category is locked in */}
        {!lockedCategory && (
          <>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
                  onPress={() => setCategory(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Label */}
        <Text style={styles.sectionTitle}>Label <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. White linen shirt"
          placeholderTextColor="#C7C7CC"
          value={label}
          onChangeText={setLabel}
          maxLength={40}
          returnKeyType="done"
        />

        {/* Color */}
        <Text style={styles.sectionTitle}>Color <Text style={styles.optional}>(optional)</Text></Text>
        <View style={styles.colorGrid}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.hex },
                color === c.value && styles.colorSwatchSelected,
              ]}
              onPress={() => setColor(color === c.value ? null : c.value)}
              activeOpacity={0.8}
            >
              {color === c.value && <Text style={styles.colorCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
        {color && (
          <Text style={styles.colorLabel}>
            {COLORS.find((c) => c.value === color)?.label}
          </Text>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, (!imageUri || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!imageUri || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? 'Save Changes' : 'Save to Wardrobe'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 48,
  },
  photoSection: {
    marginBottom: 28,
  },
  preview: {
    width: '100%',
    height: 300,
  },
  changePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  photoPlaceholder: {
    height: 220,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#FF69B4',
    borderRadius: 10,
  },
  photoBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF69B4',
  },
  photoBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  photoBtnOutlineText: {
    color: '#FF69B4',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  optional: {
    fontWeight: '400',
    color: '#8E8E93',
    fontSize: 13,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    backgroundColor: '#FAFAFA',
  },
  categoryChipActive: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  categoryEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryLabelActive: {
    color: '#FF69B4',
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#FAFAFA',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#FF69B4',
  },
  colorCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  colorLabel: {
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: '#FF69B4',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnDisabled: {
    backgroundColor: '#C7C7CC',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
