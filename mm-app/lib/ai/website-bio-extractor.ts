import { load } from 'cheerio'
import { UnifiedAIClient } from './unified-client'

export interface WebsiteBioExtractorResponse {
  bio: string;
  status: 'success' | 'error';
  error?: string;
}

export async function extractBioFromWebsite(
  url: string,
  client: UnifiedAIClient
): Promise<WebsiteBioExtractorResponse> {
  try {
    // Validate and normalize URL
    let validUrl: URL
    try {
      validUrl = new URL(url)
      // Add protocol if missing
      if (!validUrl.protocol) {
        validUrl = new URL(`https://${url}`)
      }
    } catch {
      return {
        bio: '',
        status: 'error',
        error: 'Invalid URL format'
      }
    }

    console.log('Fetching URL:', validUrl.toString())
    
    // Fetch website content
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText)
      return {
        bio: '',
        status: 'error',
        error: `Failed to fetch website: ${response.statusText}`
      }
    }

    const html = await response.text()
    console.log('Fetched HTML length:', html.length)

    const $ = load(html)

    // Common selectors where bios are typically found, in order of priority
    const bioSelectors = [
      // About page specific selectors
      'main[role="main"] p',
      'div[role="main"] p',
      '[data-testid="about-text"]',
      '[data-testid="bio-text"]',
      
      // Common bio containers
      '.biography',
      '.biography p',
      '.bio-content',
      '.bio-content p',
      '.about-content',
      '.about-content p',
      '.profile-bio',
      '.profile-bio p',
      
      // Generic about/bio sections
      'section.about',
      'section.about p',
      'div.about',
      'div.about p',
      '#about p',
      '.bio',
      '.bio p',
      '#bio',
      '#bio p',
      
      // Meta tags
      'meta[name="description"]',
      'meta[property="og:description"]',
      
      // Fallback to content with bio/about keywords
      'p:contains("About")',
      'p:contains("Bio")',
      'div:contains("About")',
      'div:contains("Bio")'
    ]

    let scrapedContent = ''
    let foundSelector = ''

    // Try meta tags first
    const metaDescription = $('meta[name="description"]').attr('content')
    const ogDescription = $('meta[property="og:description"]').attr('content')

    if (metaDescription || ogDescription) {
      scrapedContent = metaDescription || ogDescription || ''
      foundSelector = metaDescription ? 'meta[name="description"]' : 'meta[property="og:description"]'
    } else {
      // Try other selectors and collect all potential bio content
      const bioTexts: string[] = []
      
      for (const selector of bioSelectors) {
        const elements = $(selector)
        if (elements.length) {
          elements.each((_, el) => {
            const text = $(el).text().trim()
            if (text && text.split(' ').length > 5) {
              bioTexts.push(text)
            }
          })
        }
      }

      // Join all found bio texts
      scrapedContent = bioTexts.join('\n\n')
    }

    console.log('Found content using selector:', foundSelector)
    //console.log('Scraped content:', scrapedContent)

    // Use UnifiedAIClient to analyze and extract the bio
    if (scrapedContent) {
      const prompt = `
        I have scraped content from a website that might contain a bio or about information. 
        Please analyze this content and extract a professional bio or cv.
        If the content contains multiple sections, use multiple paragraphs to create.
        Don't leave any relevant information out. 
        Do not use markdown formatting or special characters.
        Do not include headers or section titles.
        Do not use bullet points or lists.
        Return the bio as plain text with standard paragraphs.
        Do not include contact information.
        
        Content to analyze:
        ${scrapedContent}
      `

      try {
        const response = await client.sendMessage(prompt, {
          temperature: 0.7,
          maxTokens: 1024
        })

        console.log('AI-generated bio:', response.content)

        if (response.content) {
          return {
            bio: response.content,
            status: 'success'
          }
        }
      } catch (err) {
        console.error('Error generating AI bio:', err)
        // Fall back to cleaned scraped content if AI fails
      }
    }

    // Clean up the scraped text as fallback
    const cleanedBio = scrapedContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
      .trim()

    if (!cleanedBio) {
      console.log('No bio content found')
      return {
        bio: '',
        status: 'error',
        error: 'No bio content found on the website'
      }
    }

    console.log('Using cleaned scraped bio:', cleanedBio)
    return {
      bio: cleanedBio,
      status: 'success'
    }
  } catch (err) {
    console.error('Error extracting bio:', err)
    return {
      bio: '',
      status: 'error',
      error: err instanceof Error ? err.message : 'Failed to extract bio'
    }
  }
} 