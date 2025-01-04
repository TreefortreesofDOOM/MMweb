# Patron (Collector) Role Documentation

## Overview
The patron role is designed for art collectors and enthusiasts who want to discover, collect, and engage with artists on the platform.

### Ideas for future features:
 - settings option to allow patrons to remain anonymous to other users.


## Features
Reference to features from role-selection-wizard.tsx:

### Immediate Features
- Collect Art: Build personal art collections
- Message Artists: Direct communication with creators
- Follow Artists: Stay updated with favorite artists

### Advanced Features
- Collection Management: Organize and showcase collections
- Early Access: Preview new artworks before release
- Private Galleries: Access to exclusive collections

## Navigation
Patrons have access to specific navigation items:
- Browse Art: Discover new artworks
- My Collection: View and manage collected pieces
- Following: Track favorite artists

## Role Selection
When users choose the "Collector" path during onboarding:
- Database Role: 'patron'
- AI Persona: 'collector'
- Default Context: Art collection and appreciation

## Permissions
- Can view and purchase artworks
- Access to private gallery features
- Direct messaging with artists
- Collection management tools
- Early access to new releases
- Profile customization options

## AI Integration
The patron role is mapped to the 'collector' persona for AI interactions, providing:
- Art collection guidance
- Market insights
- Collection management tips
- Artist recommendations

## Context-Aware Behavior
Based on page type:
- Artwork View: Focus on collectible value and market position
- Gallery View: Curation insights and collection opportunities
- Artist Profiles: Career trajectory and collecting opportunities
- General: Market trends and portfolio development

## Migration Path
1. Role is stored as 'patron' in database
2. Equivalent to 'collector' in AI context
3. Has elevated access compared to basic 'user' role
4. Can be upgraded from 'user' role

## Best Practices
- Use `is_collector()` helper function for role checks
- Implement proper route protection for collector features
- Consider collector-specific UI elements
- Maintain clear separation between browsing and collecting features

## Security Considerations
- RLS policies for private gallery access
- Protected collection management routes
- Secure messaging channels
- Transaction security for purchases
