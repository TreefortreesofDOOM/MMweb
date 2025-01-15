import { Content } from "@google/generative-ai";
import { type AssistantPersona } from '@/lib/unified-ai/types';

export interface UserContext {
    id: string;
    displayName?: string;
    firstName?: string;  // From database first_name
    lastName?: string;   // From database last_name
    email?: string;
    role: AssistantPersona;
}

export interface AssistantContext {
    assistantName: string;
    userContext: UserContext;
}

export interface ArtworkContext {
    artwork: {
        title: string;
        description: string;
        price: number;
    };
    similarArtworks?: Array<{
        title: string;
        artist_name: string;
    }>;
}

export interface SystemInstruction {
    instruction: string;
    contextMessage?: Content;
}

// Helper functions for name handling
export function getUserDisplayName(userContext: UserContext, formal: boolean = false): string {
    // If display name is set, use that as the preferred way of addressing
    if (userContext.displayName) {
        return userContext.displayName;
    }
    
    // If we have first/last name
    if (userContext.firstName || userContext.lastName) {
        if (formal && userContext.lastName) {
            // Formal: "Mr./Ms. Smith"
            return `${userContext.role === 'collector' ? 'Mr./Ms.' : ''} ${userContext.lastName}`;
        } else if (userContext.firstName) {
            // Casual: "John"
            return userContext.firstName;
        } else if (userContext.lastName) {
            // Only last name available
            return userContext.lastName;
        }
    }
    
    // Fallback to role-based
    return getRoleBasedFallback(userContext.role);
}

export function getFullName(userContext: UserContext, formal: boolean = false): string {
    if (userContext.firstName && userContext.lastName) {
        if (formal && userContext.role === 'collector') {
            return `Mr./Ms. ${userContext.firstName} ${userContext.lastName}`;
        }
        return `${userContext.firstName} ${userContext.lastName}`;
    }
    return getUserDisplayName(userContext, formal);
}

export function getRoleBasedFallback(role: AssistantPersona): string {
    switch (role) {
        case 'mentor':
            return 'artist';
        case 'collector':
            return 'collector';
        case 'curator':
            return 'curator';
        case 'advisor':
            return 'admin';
        default:
            return 'visitor';
    }
} 