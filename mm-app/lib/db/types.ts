export interface Profile {
    id: string;
    created_at: string;
    updated_at: string;
    full_name: string;  // Keeping for backward compatibility
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
    role: 'artist' | 'patron' | 'visitor' | 'anonymous';
    // ... other existing fields
} 