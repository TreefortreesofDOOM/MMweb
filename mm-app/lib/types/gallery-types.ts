import type { Database } from './database.types';

/**
 * Represents an artwork with its associated artist profile information.
 * This type is used when querying artworks with their creator's profile data
 * through the artworks_artist_id_fkey relationship.
 * Used specifically in gallery show contexts where we need the full creator profile.
 */
export type ArtworkWithCreatorProfile = Database['public']['Tables']['artworks']['Row'] & {
  artist: Database['public']['Tables']['profiles']['Row'];
};

/**
 * Legacy type for artwork with basic artist information.
 * Used in existing components that expect the 'artist' field.
 * Consider using ArtworkWithCreatorProfile for new code.
 * @deprecated Use ArtworkWithCreatorProfile for new code
 */
export type ArtworkWithArtist = Database['public']['Tables']['artworks']['Row'] & {
  artist: Database['public']['Tables']['profiles']['Row'];
};

// Use the database enum type
export type GalleryWallType = Database['public']['Enums']['gallery_wall_type'];

// Show status type
export const GALLERY_SHOW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type GalleryShowStatus = typeof GALLERY_SHOW_STATUS[keyof typeof GALLERY_SHOW_STATUS];

/**
 * Base interface for creating a gallery show.
 * Contains the essential fields needed when submitting a new show.
 */
export interface GalleryShow {
  title: string;
  startDate: string;
  endDate: string;
  artworkIds: string[];
}

/**
 * Type for inserting a new gallery show into the database.
 * Maps the GalleryShow interface to match database column names.
 */
export type GalleryShowInsert = Omit<Database['public']['Tables']['gallery_shows']['Insert'], 'id'> & {
  start_date: GalleryShow['startDate'];
  end_date: GalleryShow['endDate'];
};

/**
 * Represents a gallery show with all its related data:
 * - Show details from gallery_shows table
 * - Creator's profile information
 * - Associated artworks with their creators' profiles
 */
export interface GalleryShowWithDetails {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_profile: {
    id: string;
    name: string;
  };
  approved_by_profile?: {
    id: string;
    name: string;
  } | null;
  artworks: {
    artwork: {
      id: string;
      title: string;
      images: any;
      artist: {
        id: string;
        name: string;
      };
    };
  }[];
}

// Database row type
type GalleryDateRow = Database['public']['Tables']['gallery_dates']['Row'];

/**
 * Mapped interface for gallery dates with camelCase properties.
 * Used in the UI layer to maintain consistent property naming.
 */
export interface GalleryDate {
  date: string;
  isAvailable: boolean | null;
  updatedAt: string | null;
  updatedBy: string | null;
} 