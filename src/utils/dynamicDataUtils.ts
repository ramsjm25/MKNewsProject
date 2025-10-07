import apiClient from '../api/apiClient';



// Type definitions

export interface Language {

  id: string;

  language_name: string;

  language_code: string;

  icon: string;

  is_active: number;

  created_at: string;

  updated_at: string;

  is_deleted: number;

  deleted_at: string | null;

}



export interface State {

  id: string;

  state_name: string;

  state_code: string;

  language_id: string;

  is_active: number;

  created_at: string;

  updated_at: string;

  is_deleted: number;

  deleted_at: string | null;

}



export interface District {

  id: string;

  name: string;

  language_id: string;

  state_id: string;

  icon: string;

  description: string;

  is_active: number;

  created_at: string;

  updated_at: string;

  is_deleted: number;

  deleted_at: string | null;

}



export interface Category {

  id: string;

  category_name: string;

  language_id: string;

  slug: string;

  description: string;

  icon: string;

  color: string;

  sort_order: number;

  is_active: number;

  created_at: string;

  updated_at: string;

  is_deleted: number;

  deleted_at: string | null;

}



export interface ApiResponse<T> {

  status: number;

  message: string;

  result: T[];

}



// Cache configuration - now using session storage



// Helper function to get direct API URL

const getDirectApiUrl = (endpoint: string, params: Record<string, any>): string => {

  // In development, use the local Vercel functions
  const baseUrl = '/api';
  

  // Map our internal endpoints to the new consolidated API endpoints
  const endpointMap: Record<string, string> = {

    '/api': '/'
  };

  

  const actualEndpoint = endpointMap[endpoint] || endpoint.replace('/api/', '/');
  const url = new URL(`${baseUrl}${actualEndpoint}`);

  
  
  Object.entries(params).forEach(([key, value]) => {

    if (value !== undefined && value !== null) {

      url.searchParams.append(key, String(value));

    }

  });

  
  
  return url.toString();

};



// Main data fetching function with session storage caching

export const fetchAndCacheData = async <T>(

  apiEndpoint: string,

  params: Record<string, any> = {},

  cacheKey: string

): Promise<T[]> => {

  // Create a unique cache key that includes the parameters

  const fullCacheKey = `${cacheKey}-${JSON.stringify(params)}`;

  const cachedData = sessionStorage.getItem(fullCacheKey);

  const cachedTimestamp = sessionStorage.getItem(`${fullCacheKey}_timestamp`);



  // Check if we have valid cached data

  if (cachedData && cachedTimestamp) {

    const now = new Date().getTime();

    const timestamp = parseInt(cachedTimestamp, 10);

    const twentyFourHours = 24 * 60 * 60 * 1000;



    if (now - timestamp < twentyFourHours) {

      console.log(`[DynamicData] Using cached data for ${cacheKey}`);

      return JSON.parse(cachedData);

    } else {

      console.log(`[DynamicData] Cache expired for ${cacheKey}`);

      sessionStorage.removeItem(fullCacheKey);

      sessionStorage.removeItem(`${fullCacheKey}_timestamp`);

    }

  }



  // Always use local Vercel functions first (both development and production)
  console.log(`[DynamicData] Using local Vercel functions for ${cacheKey}`);

  // Try our local Vercel API route first
  try {
    console.log(`[DynamicData] Trying local Vercel API for ${cacheKey}:`, apiEndpoint, params);
    
    
    // Try our API route first

    const response = await apiClient.get<ApiResponse<T>>(apiEndpoint, { params });

    
    
    if (response.data.status === 1 && Array.isArray(response.data.result)) {

      const filteredData = response.data.result.filter((item: any) => 

        item.is_deleted !== 1 && item.is_active === 1

      );

      

      console.log(`[DynamicData] Fetched ${filteredData.length} ${cacheKey} from local Vercel API`);
      
      
      // Cache the data in session storage

      sessionStorage.setItem(fullCacheKey, JSON.stringify(filteredData));

      sessionStorage.setItem(`${fullCacheKey}_timestamp`, new Date().getTime().toString());

      
      
      return filteredData;

    } else {

      throw new Error(`Invalid response format for ${cacheKey}: ${response.data.message || 'Unknown error'}`);

    }

  } catch (error: any) {

    console.error(`[DynamicData] Local Vercel API failed for ${cacheKey}, trying external API:`, error);
    
    // Fallback to direct external API call
    try {
      // Map to external API endpoints based on the type parameter
      let externalUrl = '';
      const { type } = params;
      
      // Get API base URL from environment variables
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 
                        process.env.VITE_API_BASE_URL || 
                        'https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1';
      
      switch (type) {
        case 'languages':
          externalUrl = `${apiBaseUrl}/news/languages`;
          break;
        case 'categories':
          externalUrl = `${apiBaseUrl}/news/categories?language_id=${params.language_id}`;
          break;
        case 'states':
          externalUrl = `${apiBaseUrl}/news/states?language_id=${params.language_id}`;
          break;
        case 'districts':
          externalUrl = `${apiBaseUrl}/news/districts?language_id=${params.language_id}&state_id=${params.state_id}`;
          break;
        default:
          throw new Error(`Unknown type for external API: ${type}`);
      }
      
      console.log(`[DynamicData] Trying direct external API: ${externalUrl}`);
      
      const directResponse = await fetch(externalUrl, {
        method: 'GET',

        headers: { 'Content-Type': 'application/json' },

      });

      
      
      if (!directResponse.ok) {

        throw new Error(`Direct external API failed with status: ${directResponse.status}`);
      }

      
      
      const directData = await directResponse.json();

      
      
      if (directData.status === 1 && Array.isArray(directData.result)) {

        const filteredData = directData.result.filter((item: any) => 

          item.is_deleted !== 1 && item.is_active === 1

        );

        

        console.log(`[DynamicData] Fetched ${filteredData.length} ${cacheKey} from direct external API`);
        
        
        // Cache the data in session storage

        sessionStorage.setItem(fullCacheKey, JSON.stringify(filteredData));

        sessionStorage.setItem(`${fullCacheKey}_timestamp`, new Date().getTime().toString());

        
        
        return filteredData;

      } else {

        throw new Error(`Invalid direct external API response format for ${cacheKey}`);
      }

    } catch (directError: any) {

      console.error(`[DynamicData] Direct external API also failed for ${cacheKey}:`, directError);
      throw new Error(`Both API routes failed: ${error.message || directError.message}`);

    }

  }

};



// Helper function to create a comprehensive search string
const createSearchString = (category: Category): string => {
  return [
    category.category_name,
    category.slug,
    category.description || '',
    // Add common variations
    category.category_name.replace(/[^\w\s]/g, ''), // Remove special characters
    category.slug.replace(/[^\w\s]/g, ''), // Remove special characters
  ].join(' ').toLowerCase();
};

// Helper function to get multilingual variations for better category matching
// This function now relies on API data instead of hardcoded translations
const getMultilingualVariations = (type: string, languageCode: string, categoryKeywords?: Record<string, Record<string, string[]>>): string[] => {
  const variations: string[] = [];
  
  // Get variations from API category keywords if available
  if (categoryKeywords && categoryKeywords[languageCode] && categoryKeywords[languageCode][type]) {
    variations.push(...categoryKeywords[languageCode][type]);
  }
  
  // Add common English variations as fallback
  const englishVariations = [
    type,
    type + 's',
    type.replace(/s$/, ''),
    type.replace(/ies$/, 'y')
  ];
  variations.push(...englishVariations);
  
  return variations;
};



// Completely dynamic category matching - works with any category names from API
export const getCategoryIdsByType = (categories: Category[], type: string, urgencyPatterns?: Record<string, string[]>, categoryKeywords?: Record<string, Record<string, string[]>>, languageId?: string, languages?: Language[]): string[] => {

  const typeLower = type.toLowerCase();

  
  
  console.log(`[DynamicData] getCategoryIdsByType called with type: ${type}`);

  console.log(`[DynamicData] Available categories:`, categories.map(cat => ({

    id: cat.id,

    name: cat.category_name,

    slug: cat.slug,

    description: cat.description,
    language_id: cat.language_id
  })));

  

  // Get language code from language ID for dynamic keyword lookup
  const getLanguageCodeFromId = (langId?: string): string => {
    if (!langId || !languages) return 'en'; // Default to English
    
    // Find the language by ID and get its code
    const language = languages.find(lang => lang.id === langId);
    return language?.language_code || 'en'; // Default to English if not found
  };

  // Get keywords for the current type and language from API data
  const languageCode = getLanguageCodeFromId(languageId);
  const keywords = categoryKeywords?.[languageCode]?.[typeLower] || [];
  
  console.log(`[DynamicData] getCategoryIdsByType debug:`, {
    type,
    languageId,
    languageCode,
    keywordsCount: keywords.length,
    keywords: keywords.slice(0, 5), // Show first 5 keywords
    categoryKeywordsAvailable: !!categoryKeywords,
    languagesAvailable: !!languages,
    categoriesCount: categories.length,
    categoryKeywordsKeys: categoryKeywords ? Object.keys(categoryKeywords) : [],
    languageKeywords: categoryKeywords?.[languageCode] ? Object.keys(categoryKeywords[languageCode]) : [],
    urgencyPatternsAvailable: !!urgencyPatterns,
    urgencyPatternsKeys: urgencyPatterns ? Object.keys(urgencyPatterns) : [],
    // Show sample categories for debugging
    sampleCategories: categories.slice(0, 3).map(cat => ({
      id: cat.id,
      name: cat.category_name,
      language_id: cat.language_id
    }))
  });

  // If no keywords available from API, we need to handle this gracefully
  // For breaking news, we can still use urgency patterns
  // For other categories, we'll use a more permissive approach
  if (keywords.length === 0) {
    console.log(`[DynamicData] No keywords found for type '${type}' in language '${languageCode}'. Will use alternative matching strategies.`);
  }

  // Special handling for breaking news - ensure it works even without category keywords
  if (typeLower === 'breaking' && keywords.length === 0) {
    console.log(`[DynamicData] Breaking news with no category keywords - will rely on urgency patterns and type matching`);
  }
  
  // Get urgency patterns for breaking news - use language-specific patterns
  let allUrgencyPatterns: string[] = [];
  if (typeLower === 'breaking' && urgencyPatterns) {
    // Get urgency patterns for the specific language
    const languageUrgencyPatterns = urgencyPatterns[languageCode] || [];
    // Also include patterns from all languages as fallback
    allUrgencyPatterns = [...languageUrgencyPatterns, ...Object.values(urgencyPatterns).flat()];
    console.log(`[DynamicData] Urgency patterns for breaking news:`, {
      urgencyPatternsAvailable: !!urgencyPatterns,
      languageCode,
      languageUrgencyPatterns,
      allUrgencyPatternsCount: allUrgencyPatterns.length,
      allUrgencyPatterns: allUrgencyPatterns.slice(0, 10), // Show first 10 patterns
      urgencyPatternsByLanguage: urgencyPatterns
    });
  }
  
  // Enhanced multilingual category matching - works for any language
  const matchedCategories = categories.filter(category => {
    const name = category.category_name.toLowerCase();
    const slug = category.slug.toLowerCase();
    const description = (category.description || '').toLowerCase();
    
    // Create a comprehensive search string
    const searchString = `${name} ${slug} ${description}`;

    // Check against multilingual keywords from API
    const hasKeywordMatch = keywords.some(keyword => 
      searchString.includes(keyword.toLowerCase())
    );

    // Enhanced multilingual type matching
    let hasTypeMatch = false;
    const typeWords = typeLower.split(/[\s-_]+/).filter(word => word.length > 0);
    
    // For non-English languages, we need more flexible matching
    // Check if any part of the category name/slug matches the type
    hasTypeMatch = typeWords.some(word => 
      name.includes(word) || 
      slug.includes(word) || 
      description.includes(word)
    );

    // For breaking news, also check for urgency indicators from API
    let hasUrgencyMatch = false;
    if (typeLower === 'breaking' && allUrgencyPatterns.length > 0) {
      hasUrgencyMatch = allUrgencyPatterns.some((pattern: string) => 
        searchString.includes(pattern.toLowerCase())
      );
    }

    // Enhanced multilingual matching for better language support
    let hasSmartMatch = false;
    if (typeLower === 'breaking') {
      // For breaking news, rely on urgency patterns from API
      // If no urgency patterns available, use basic type matching
      hasSmartMatch = allUrgencyPatterns.length === 0 && hasTypeMatch;
    } else {
      // Enhanced matching for different languages
      const typeVariations = [
        typeLower,
        typeLower + 's', // plural
        typeLower.replace(/s$/, ''), // singular
        typeLower.replace(/ies$/, 'y'), // business -> busines
        typeLower.replace(/ies$/, 'ies'), // politics -> politics
      ];
      
      // Add common translations/variations for better multilingual support
      const multilingualVariations = getMultilingualVariations(typeLower, languageCode, categoryKeywords);
      const allVariations = [...typeVariations, ...multilingualVariations];
      
      hasSmartMatch = allVariations.some(variation => 
        name.includes(variation) || slug.includes(variation) || description.includes(variation)
      );
    }

    // Enhanced matching for better language support
    let hasEnhancedMatch = false;
    if (!hasKeywordMatch && !hasTypeMatch && !hasUrgencyMatch && !hasSmartMatch) {
      // Try partial word matching for better language support
      const partialMatches = typeWords.some(word => {
        if (word.length < 3) return false; // Skip very short words
        return name.includes(word.substring(0, 3)) || 
               slug.includes(word.substring(0, 3)) || 
               description.includes(word.substring(0, 3));
      });
      hasEnhancedMatch = partialMatches;
    }

    // Fallback: If no other matching works, try to match based on category ID patterns
    // This helps when categories have specific IDs that correspond to types
    let hasIdMatch = false;
    if (!hasKeywordMatch && !hasTypeMatch && !hasUrgencyMatch && !hasSmartMatch && !hasEnhancedMatch) {
      // Check if category ID contains type-related patterns
      const categoryId = String(category.id).toLowerCase();
      hasIdMatch = typeWords.some(word => categoryId.includes(word));
    }

    // Final fallback: If still no match, try a very permissive approach
    // This helps when categories exist but don't match any of our patterns
    let hasPermissiveMatch = false;
    if (!hasKeywordMatch && !hasTypeMatch && !hasUrgencyMatch && !hasSmartMatch && !hasEnhancedMatch && !hasIdMatch) {
      // For non-English languages, be more permissive and try to match any category
      // that might be related to the type based on common patterns
      const permissivePatterns = [
        // Common patterns that might appear in any language
        'news', 'latest', 'current', 'today', 'recent',
        'update', 'information', 'report', 'story'
      ];
      
      hasPermissiveMatch = permissivePatterns.some(pattern => 
        name.includes(pattern) || slug.includes(pattern) || description.includes(pattern)
      );
    }

    const isMatch = hasKeywordMatch || hasTypeMatch || hasUrgencyMatch || hasSmartMatch || hasEnhancedMatch || hasIdMatch || hasPermissiveMatch;
    console.log(`[DynamicData] Category "${category.category_name}" (${category.id}): keywordMatch=${hasKeywordMatch}, typeMatch=${hasTypeMatch}, urgencyMatch=${hasUrgencyMatch}, smartMatch=${hasSmartMatch}, enhancedMatch=${hasEnhancedMatch}, idMatch=${hasIdMatch}, permissiveMatch=${hasPermissiveMatch}, isMatch=${isMatch}`);
    
    return isMatch;
  });
  
  const categoryIds = matchedCategories.map(cat => cat.id);
  console.log(`[DynamicData] Matched ${matchedCategories.length} categories for type '${type}':`, matchedCategories.map(cat => ({
    id: cat.id,
    name: cat.category_name,
    slug: cat.slug,
    language_id: cat.language_id
  })));
  console.log(`[DynamicData] Category IDs:`, categoryIds);
  
  // If no categories matched, try to return all available categories for this language
  // This ensures that sections will still show some content even if category matching fails
  if (categoryIds.length === 0 && categories.length > 0) {
    console.log(`[DynamicData] No categories matched for type '${type}', returning all available categories for language ${languageId} as fallback`);
    const fallbackCategoryIds = categories.map(cat => cat.id);
    console.log(`[DynamicData] Fallback category IDs:`, fallbackCategoryIds);
    return fallbackCategoryIds;
  }
  
  return categoryIds;
};



// Debug function for category matching
export const debugCategoryMatching = (categories: Category[], type: string) => {
  console.log(`[DynamicData] Debugging category matching for type: ${type}`);
  console.log(`[DynamicData] Available categories:`, categories.map(cat => ({
    id: cat.id,
    name: cat.category_name,
    slug: cat.slug,
    description: cat.description
  })));
  
  const matched = getCategoryIdsByType(categories, type);
  console.log(`[DynamicData] Matched category IDs for ${type}:`, matched);
  
  return matched;
};
