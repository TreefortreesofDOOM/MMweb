import type { ExtractedData } from './types'

interface VertexAIDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

interface VertexAIData {
  documents: VertexAIDocument[];
}

interface Artwork {
  id: string;
  display_order?: number;
  title: string;
  artist_id: string;
}

export function formatForVertexAI(data: ExtractedData): VertexAIData {
  // Create a map of artist IDs to their artwork counts
  const artworkCounts = data.artworks.reduce((acc, artwork) => {
    acc[artwork.artist_id] = (acc[artwork.artist_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Create a map of artist IDs to their artworks
  const artistArtworks = data.artworks.reduce((acc, artwork) => {
    if (!acc[artwork.artist_id]) {
      acc[artwork.artist_id] = [];
    }
    acc[artwork.artist_id].push(artwork);
    return acc;
  }, {} as Record<string, Artwork[]>);

  return {
    documents: [
      // Artists
      ...data.profiles.map((profile) => {
        const artworkCount = artworkCounts[profile.id] || 0;
        const artistArtworkList = artistArtworks[profile.id] || [];
        const verificationInfo = profile.verification_requirements ? 
          Object.entries(profile.verification_requirements)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.split('_').join(' '))
            .join(', ') : '';

        const artistStatus = profile.artist_status === 'approved' ? 'approved artist' : 
          profile.artist_status === 'pending' ? 'pending approval' : 
          profile.artist_status === 'rejected' ? 'not approved' : 'status unknown';

        const verificationProgress = profile.verification_progress ? 
          `${profile.verification_progress}% verified` : '';

        // Get a list of artwork titles
        const artworkTitles = artistArtworkList
          .sort((a: Artwork, b: Artwork) => (a.display_order || 0) - (b.display_order || 0))
          .map((a: Artwork) => a.title)
          .join(', ');

        return {
          id: `artist-${profile.id}`,
          content: [
            `Summary: ${profile.first_name} ${profile.last_name} is a ${profile.role} based in ${profile.location || 'Unknown Location'} with ${artworkCount} published artworks. ${profile.exhibition_badge ? 'They are featured in our exhibition.' : ''} ${verificationProgress}`,
            profile.bio && `Biography: ${profile.bio}`,
            profile.location && `Location: ${profile.location}`,
            profile.instagram && `Instagram: ${profile.instagram}`,
            profile.website && `Website: ${profile.website}`,
            `Exhibition Featured: ${profile.exhibition_badge ? 'Yes' : 'No'}`,
            `Total Artworks: ${artworkCount}`,
            artworkTitles && `Published Works: ${artworkTitles}`,
            `Application Status: ${profile.application_status}`,
            verificationInfo && `Verification Achievements: ${verificationInfo}`,
            `Community Engagement Level: ${profile.community_engagement_score}/100`,
            profile.artist_application && `Application Notes: ${JSON.stringify(profile.artist_application)}`
          ].filter(Boolean).join('\n'),
          metadata: {
            docType: 'artist',
            artworkCount,
            artworkIds: artistArtworkList.map((a: Artwork) => a.id),
            verificationProgress: profile.verification_progress,
            ...profile
          }
        }
      }),

      // Artworks
      ...data.artworks.map((artwork) => {
        const artist = data.profiles.find(p => p.id === artwork.artist_id);
        const embedding = data.embeddings?.find(e => e.artwork_id === artwork.id);
        const imageCount = Array.isArray(artwork.images) ? artwork.images.length : 0;

        return {
          id: `artwork-${artwork.id}`,
          content: [
            `Summary: "${artwork.title}" is a ${artwork.status} artwork by ${artist?.first_name} ${artist?.last_name}${artwork.price ? ` priced at $${artwork.price}` : ''}. ${imageCount ? `Includes ${imageCount} images.` : ''}`,
            artwork.description && `Description: ${artwork.description}`,
            artist && `Artist: ${artist.first_name} ${artist.last_name} - ${artist.role} from ${artist.location || 'Unknown Location'}`,
            artwork.styles?.length && `Art Styles: ${artwork.styles.join(', ')}`,
            artwork.techniques?.length && `Techniques Used: ${artwork.techniques.join(', ')}`,
            artwork.keywords?.length && `Keywords: ${artwork.keywords.join(', ')}`,
            `Created: ${new Date(artwork.created_at || '').toLocaleDateString()}`,
            `Display Order: ${artwork.display_order || 'Not set'}`
          ].filter(Boolean).join('\n'),
          metadata: {
            docType: 'artwork',
            artistId: artwork.artist_id,
            artistName: `${artist?.first_name} ${artist?.last_name}`,
            artistRole: artist?.role,
            artistLocation: artist?.location,
            imageCount,
            displayOrder: artwork.display_order,
            ...artwork,
            ...(embedding?.embedding && { embedding: embedding.embedding })
          }
        }
      })
    ]
  }
} 