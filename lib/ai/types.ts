import { Content } from "@google/generative-ai";
import { type AssistantPersona } from '@/lib/unified-ai/types';

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