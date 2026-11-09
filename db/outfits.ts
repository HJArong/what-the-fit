import { getDatabase } from './schema';
import { ClothingItem } from './clothing';

export interface Outfit {
  id: number;
  name: string | null;
  top_id: number | null;
  bottom_id: number | null;
  shoes_id: number | null;
  created_at: string;
}

export interface OutfitWithItems extends Outfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
}

async function fetchItem(
  db: Awaited<ReturnType<typeof getDatabase>>,
  id: number | null
): Promise<ClothingItem | null> {
  if (!id) return null;
  return db.getFirstAsync<ClothingItem>(
    'SELECT * FROM clothing_items WHERE id = ?',
    [id]
  );
}

export async function getAllOutfits(): Promise<OutfitWithItems[]> {
  const db = await getDatabase();
  const outfits = await db.getAllAsync<Outfit>(
    'SELECT * FROM outfits ORDER BY created_at DESC'
  );
  return Promise.all(
    outfits.map(async (o) => ({
      ...o,
      top: await fetchItem(db, o.top_id),
      bottom: await fetchItem(db, o.bottom_id),
      shoes: await fetchItem(db, o.shoes_id),
    }))
  );
}

export async function getOutfitById(id: number): Promise<OutfitWithItems | null> {
  const db = await getDatabase();
  const outfit = await db.getFirstAsync<Outfit>(
    'SELECT * FROM outfits WHERE id = ?',
    [id]
  );
  if (!outfit) return null;
  return {
    ...outfit,
    top: await fetchItem(db, outfit.top_id),
    bottom: await fetchItem(db, outfit.bottom_id),
    shoes: await fetchItem(db, outfit.shoes_id),
  };
}

export async function saveOutfit(
  topId: number | null,
  bottomId: number | null,
  shoesId: number | null,
  name?: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO outfits (name, top_id, bottom_id, shoes_id) VALUES (?, ?, ?, ?)',
    [name ?? null, topId, bottomId, shoesId]
  );
  return result.lastInsertRowId;
}

export async function deleteOutfit(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM outfits WHERE id = ?', [id]);
}
