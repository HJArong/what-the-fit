import { File, Paths } from 'expo-file-system';
import { getDatabase } from './schema';

export type Category = 'top' | 'bottom' | 'shoes';

export interface ClothingItem {
  id: number;
  image_uri: string;
  category: Category;
  label: string | null;
  color: string | null;
  created_at: string;
}

export async function getAllClothing(): Promise<ClothingItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<ClothingItem>(
    'SELECT * FROM clothing_items ORDER BY created_at DESC'
  );
}

export async function getClothingById(id: number): Promise<ClothingItem | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ClothingItem>(
    'SELECT * FROM clothing_items WHERE id = ?',
    [id]
  );
}

export async function getClothingByCategory(category: Category): Promise<ClothingItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<ClothingItem>(
    'SELECT * FROM clothing_items WHERE category = ? ORDER BY created_at DESC',
    [category]
  );
}

export async function addClothingItem(
  imageUri: string,
  category: Category,
  label?: string,
  color?: string
): Promise<number> {
  const filename = `clothing_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const src = new File(imageUri);
  const dest = new File(Paths.document, filename);
  src.copy(dest);

  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO clothing_items (image_uri, category, label, color) VALUES (?, ?, ?, ?)',
    [dest.uri, category, label ?? null, color ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateClothingItem(
  id: number,
  label: string | null,
  color: string | null,
  newImageUri?: string
): Promise<void> {
  const db = await getDatabase();

  if (newImageUri) {
    const filename = `clothing_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const src = new File(newImageUri);
    const dest = new File(Paths.document, filename);
    src.copy(dest);

    const old = await db.getFirstAsync<{ image_uri: string }>(
      'SELECT image_uri FROM clothing_items WHERE id = ?',
      [id]
    );
    await db.runAsync(
      'UPDATE clothing_items SET label = ?, color = ?, image_uri = ? WHERE id = ?',
      [label, color, dest.uri, id]
    );
    if (old?.image_uri) {
      try { new File(old.image_uri).delete(); } catch {}
    }
  } else {
    await db.runAsync(
      'UPDATE clothing_items SET label = ?, color = ? WHERE id = ?',
      [label, color, id]
    );
  }
}

export async function deleteClothingItem(id: number): Promise<void> {
  const db = await getDatabase();
  const item = await db.getFirstAsync<{ image_uri: string }>(
    'SELECT image_uri FROM clothing_items WHERE id = ?',
    [id]
  );
  await db.runAsync('DELETE FROM clothing_items WHERE id = ?', [id]);
  if (item?.image_uri) {
    try {
      new File(item.image_uri).delete();
    } catch {
      // best-effort cleanup — file may already be gone
    }
  }
}
