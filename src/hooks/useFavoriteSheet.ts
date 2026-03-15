import { useRef, useState, useCallback } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { FavoriteSheetData } from '../components/favorites/FavoriteBottomSheet';

export default function useFavoriteSheet() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [sheetData, setSheetData] = useState<FavoriteSheetData | null>(null);

  const openSheet = useCallback(
    (bagId: string, businessId: string, bagTitle: string, businessName: string) => {
      setSheetData({ bagId, businessId, bagTitle, businessName });
      sheetRef.current?.present();
    },
    [],
  );

  return { sheetRef, sheetData, openSheet };
}
