import { loadAsync } from 'expo-font';
import { useCallback } from 'react';

export const useFonts = useCallback(async () => {
  await loadAsync({
    'Inter-Regular': require('@/client/assets/fonts/Inter-Regular.ttf'),
    'Inter-Black': require('@/client/assets/fonts/Inter-Black.ttf'),
    'Inter-Bold': require('@/client/assets/fonts/Inter-Bold.ttf'),
    'Inter-Medium': require('@/client/assets/fonts/Inter-Medium.ttf'),
    'Inter-Thin': require('@/client/assets/fonts/Inter-Thin.ttf'),
    'Inter-Light': require('@/client/assets/fonts/Inter-Light.ttf'),
    'Inter-ExtraLight': require('@/client/assets/fonts/Inter-ExtraLight.ttf'),
    'NotoJP-Black': require('@/client/assets/fonts/NotoSansJP-Black.ttf'),
    'NotoJP-Bold': require('@/client/assets/fonts/NotoSansJP-Bold.ttf'),
    'NotoJP-ExtraBold': require('@/client/assets/fonts/NotoSansJP-ExtraBold.ttf'),
    'NotoJP-ExtraLight': require('@/client/assets/fonts/NotoSansJP-ExtraLight.ttf'),
    'NotoJP-Light': require('@/client/assets/fonts/NotoSansJP-Light.ttf'),
    'NotoJP-Medium': require('@/client/assets/fonts/NotoSansJP-Medium.ttf'),
    'NotoJP-Regular': require('@/client/assets/fonts/NotoSansJP-Regular.ttf'),
    'NotoJP-SemiBold': require('@/client/assets/fonts/NotoSansJP-SemiBold.ttf'),
    'NotoJP-Thin': require('@/client/assets/fonts/NotoSansJP-Thin.ttf'),
  });
}, []);
