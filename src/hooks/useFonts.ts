import { loadAsync } from 'expo-font';
import { useCallback } from 'react';

export const useFonts = useCallback(async () => {
  await loadAsync({
    'Inter-Regular': require('@/src/assets/fonts/Inter-Regular.ttf'),
    'Inter-Black': require('@/src/assets/fonts/Inter-Black.ttf'),
    'Inter-Bold': require('@/src/assets/fonts/Inter-Bold.ttf'),
    'Inter-Medium': require('@/src/assets/fonts/Inter-Medium.ttf'),
    'Inter-Thin': require('@/src/assets/fonts/Inter-Thin.ttf'),
    'Inter-Light': require('@/src/assets/fonts/Inter-Light.ttf'),
    'Inter-ExtraLight': require('@/src/assets/fonts/Inter-ExtraLight.ttf'),
    'NotoJP-Black': require('@/src/assets/fonts/NotoSansJP-Black.ttf'),
    'NotoJP-Bold': require('@/src/assets/fonts/NotoSansJP-Bold.ttf'),
    'NotoJP-ExtraBold': require('@/src/assets/fonts/NotoSansJP-ExtraBold.ttf'),
    'NotoJP-ExtraLight': require('@/src/assets/fonts/NotoSansJP-ExtraLight.ttf'),
    'NotoJP-Light': require('@/src/assets/fonts/NotoSansJP-Light.ttf'),
    'NotoJP-Medium': require('@/src/assets/fonts/NotoSansJP-Medium.ttf'),
    'NotoJP-Regular': require('@/src/assets/fonts/NotoSansJP-Regular.ttf'),
    'NotoJP-SemiBold': require('@/src/assets/fonts/NotoSansJP-SemiBold.ttf'),
    'NotoJP-Thin': require('@/src/assets/fonts/NotoSansJP-Thin.ttf'),
  });
}, []);
