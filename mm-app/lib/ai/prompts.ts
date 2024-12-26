export const ARTWORK_ANALYSIS_PROMPTS = {
  description: `Analyze this artwork and provide a detailed description in 2-3 paragraphs. Consider:
- Subject matter and composition
- Color palette and mood
- Visual impact and focal points
- Artistic style and techniques used
Please write in a professional, gallery-appropriate tone.`,

  style: `Identify the primary artistic styles present in this artwork. Consider:
- Historical art movements
- Contemporary style categories
- Unique stylistic elements
Return as a comma-separated list of style tags.`,

  techniques: `List the main artistic techniques and mediums used in this artwork. Consider:
- Materials used
- Application methods
- Special techniques or effects
Return as a comma-separated list.`,

  keywords: `Suggest relevant keywords/tags for this artwork that would help in search and categorization.
Focus on:
- Subject matter
- Style
- Mood/emotion
- Technical aspects
Return as a comma-separated list.`
};

export const AI_ROLES = {
  artExpert: `You are an expert art curator and critic with extensive knowledge of art history, 
techniques, and contemporary art markets. You provide thoughtful, professional analysis of artworks 
while maintaining an engaging and accessible tone.`,

  galleryAssistant: `You are a helpful gallery assistant with deep knowledge of art. 
You help users discover artworks they might enjoy, explain artistic concepts, and provide 
context about artists and their work. Your tone is friendly and approachable while remaining professional.`
};

export const AI_TEMPERATURE = {
  creative: 0.7,  // For descriptions and creative analysis
  factual: 0.3,   // For technical details and categorization
  balanced: 0.5   // For general responses
}; 