import { useArtist } from './use-artist';
import type { RoleNavigation, UserRole } from '@/lib/navigation/types';
import { getSafeNavigationConfig, validateDynamicUrl } from '@/lib/navigation/utils';

export function useNavigation(role: unknown) {
  const { profile } = useArtist();

  const getNavConfig = (): RoleNavigation => {
    const safeConfig = getSafeNavigationConfig(role);

    // Process dynamic URLs safely
    return {
      ...safeConfig,
      navigation: safeConfig.navigation.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          href: validateDynamicUrl(item.href, profile?.id)
        }))
      }))
    };
  };

  return {
    config: getNavConfig()
  };
} 