
import axios from 'axios';

// Utility function to handle image URLs with better fallback
export const getImageUrl = (newsItem: any, fallbackType: string = 'news'): string => {
  // Check if news item has media with valid URL
  if (newsItem?.media && Array.isArray(newsItem.media) && newsItem.media.length > 0) {
    const media = newsItem.media[0];
    if (media.mediaUrl && typeof media.mediaUrl === 'string' && media.mediaUrl.trim() !== '') {
      return media.mediaUrl;
    }
  }
  
  // Fallback based on type
  const fallbackImages = {
    breaking: '/lovable-uploads/default-breaking-news.jpg',
    politics: '/lovable-uploads/default-politics.jpg',
    business: '/lovable-uploads/default-business.jpg',
    sports: '/lovable-uploads/default-sports.jpg',
    technology: '/lovable-uploads/default-tech.jpg',
    entertainment: '/lovable-uploads/default-entertainment.jpg',
    news: '/lovable-uploads/default-news.jpg'
  };
  
  return fallbackImages[fallbackType as keyof typeof fallbackImages] || fallbackImages.news;
};

// Utility function to validate and clean news data
export const validateNewsItem = (item: any): any => {
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  return {
    id: item.id || '',
    title: item.title || 'Untitled',
    slug: item.slug || '',
    shortNewsContent: item.shortNewsContent || item.excerpt || '',
    categoryName: item.categoryName || 'General',
    authorName: item.authorName || 'Unknown Author',
    createdAt: item.createdAt || new Date().toISOString(),
    publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
    districtName: item.districtName || '',
    media: Array.isArray(item.media) ? item.media.filter(m => m && m.mediaUrl) : [],
    source: item.source || ''
  };
};

// Reusable function to fetch news by category and language
export const fetchNewsByCategory = async (languageId: string, categoryId: string, limit: number = 20, page: number = 1) => {
  try {
    // Validate inputs
    if (!languageId || !categoryId) {
      console.warn(`[fetchNewsByCategory] Missing required parameters: languageId=${languageId}, categoryId=${categoryId}`);
      return [];
    }

    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    
    console.log(`[fetchNewsByCategory] Fetching news with params:`, {
      categoryIds: categoryId,
      language_id: languageId,
      limit,
      page,
      API_BASE
    });
    
    const res = await axios.get(`${API_BASE}/news/filter-multi-categories`, {
      params: { 
        categoryIds: categoryId,
        language_id: languageId,
        limit,
        page
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log(`[fetchNewsByCategory] API Response for categoryId: ${categoryId}, languageId: ${languageId}:`, {
      status: (res.data as any)?.status,
      hasResult: !!(res.data as any)?.result,
      hasItems: !!(res.data as any)?.result?.items,
      itemsCount: (res.data as any)?.result?.items?.length || 0,
      totalCount: (res.data as any)?.result?.totalCount || 0
    });
    
    if ((res.data as any).status === 1 && (res.data as any).result && (res.data as any).result.items) {
      const items = (res.data as any).result.items;
      // Validate and clean each news item
      const validatedItems = items.map(validateNewsItem).filter(item => item !== null);
      console.log(`[fetchNewsByCategory] Successfully fetched ${validatedItems.length} validated news items for categoryId: ${categoryId}, languageId: ${languageId}`);
      return validatedItems;
    } else {
      console.log(`[fetchNewsByCategory] No news found for categoryId: ${categoryId}, languageId: ${languageId}. Response:`, res.data);
      return [];
    }
  } catch (err: any) {
    console.error(`[fetchNewsByCategory] Error fetching news for categoryId: ${categoryId}, languageId: ${languageId}:`, {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data
    });
    return [];
  }
};

// No fallback data - everything must be fetched from API

// Centralized API configuration
const API_BASE_URL = 
  (import.meta as any).env?.API_BASE_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "https://phpstack-1520234-5847937.cloudwaysapps.com/api/v1";

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return "/api";
  }
  // In production, use the direct API URL
  return API_BASE_URL;
};

// Create a centralized API client
const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token to all requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('JWT token added to request');
    } else {
      console.log('No JWT token found in localStorage');
    }
    
    // Add any request modifications here if needed
    console.log('Making API request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    
    // Add mobile-specific headers for better debugging
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
      config.headers['X-Client-Type'] = 'mobile';
      config.headers['X-User-Agent'] = userAgent;
      console.log('Mobile device detected, adding mobile headers');
    } else {
      config.headers['X-Client-Type'] = 'desktop';
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    const err = error as any;
    
    // Suppress 404 errors for comments API (not implemented yet)
    if (err?.response?.status === 404 && err?.config?.url?.includes('/comments')) {
      // Don't log 404 errors for comments API
    } else {
      console.error("API Error:", {
        message: err?.message,
        url: err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
        type: err?.type
      });
    }

    // Handle CORS errors specifically
    if (err?.message?.includes('CORS') || err?.code === 'ERR_BLOCKED_BY_CLIENT' || err?.message?.includes('Access-Control-Allow-Origin')) {
      console.warn('CORS error detected, this should be handled by the proxy');
      return Promise.reject({
        message: "Connection error. Please refresh the page and try again.",
        status: 0,
        type: 'CORS_ERROR'
      });
    }

    // Handle different error types
    if (err?.code === 'ERR_NETWORK') {
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        status: 0,
        type: 'NETWORK_ERROR'
      });
    }

    if (err?.response?.status === 404) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Suppress 404 error details for comments API
      if (!err?.config?.url?.includes('/comments')) {
        console.error('404 Error Details:', {
          url: err?.config?.url,
          method: err?.config?.method,
          headers: err?.config?.headers,
          userAgent: navigator.userAgent,
          isMobile: isMobile
        });
      }
      
      // Provide more helpful error messages for mobile users
      let errorMessage = "Service temporarily unavailable. Please try again later.";
      if (isMobile && err?.config?.url?.includes('forgot-password')) {
        errorMessage = "Unable to send OTP. Please check your internet connection and try again.";
      } else if (isMobile && err?.config?.url?.includes('verify-code')) {
        errorMessage = "Unable to verify OTP. Please check your internet connection and try again.";
      } else if (isMobile && err?.config?.url?.includes('reset-password')) {
        errorMessage = "Unable to reset password. Please check your internet connection and try again.";
      } else if (isMobile) {
        errorMessage = "Connection issue detected. Please check your internet and try again.";
      }
      
      return Promise.reject({
        message: errorMessage,
        status: 404,
        type: 'NOT_FOUND',
        details: {
          url: err?.config?.url,
          isMobile: isMobile
        }
      });
    }

    if (err?.response?.status === 500) {
      return Promise.reject({
        message: "Server error. Please try again later.",
        status: 500,
        type: 'SERVER_ERROR'
      });
    }

    if (err?.response?.status === 403) {
      return Promise.reject({
        message: "Access denied. Please check your permissions.",
        status: 403,
        type: 'FORBIDDEN'
      });
    }

    // Handle timeout errors
    if (err?.code === 'ECONNABORTED') {
      return Promise.reject({
        message: "Request timeout. Please try again.",
        status: 0,
        type: 'TIMEOUT_ERROR'
      });
    }

    return Promise.reject(
      err?.response?.data || { 
        message: "Something went wrong. Please try again later.",
        status: err?.response?.status || 0,
        type: 'UNKNOWN_ERROR'
      }
    );
  }
);

export interface Language {
  id: string;
  languageName: string;
  code: string;
  icon: string;
  is_active: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  language_id: string;
  icon: string;
  color: string;
  is_active: number;
}

export interface State {
  id: string;
  stateName: string;
  language_id: string;
  isDeleted: number;
  is_active: number;
}

export interface District {
  id: string;
  districtName: string;
  state_id: string;
  isDeleted: number;
  is_active: number;
}

export interface LocalMandiCategory {
  id: string;
  categoryName: string;
  categoryIcon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  shortNewsContent: string;
  media: { mediaUrl: string }[];
  categoryName: string;
  districtName: string;
  stateName: string;
  readTime: string;
  authorName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  result: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Exact types for /states API response items
interface StateApiItem {
  id: string;
  name: string;
  code: string;
  language_id: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

type StatesApiResponse = ApiResponse<PaginatedResponse<StateApiItem>>;

// Retry function for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // Only retry on network errors or 5xx errors
      if (error?.type === 'NETWORK_ERROR' || (error?.status >= 500 && error?.status < 600)) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

// API service functions
export const apiService = {
  // 1. Languages Dropdown
  async getLanguages(): Promise<Language[]> {
    try {
      const response = await retryRequest(async () => 
        await apiClient.get<ApiResponse<Language[]>>('/data?type=languages')
      );
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      throw new Error('Failed to fetch languages. Please try again later.');
    }
  },

  // 2. News Categories Dropdown
  async getNewsCategories(language_id: string): Promise<NewsCategory[]> {
    try {
      const response = await retryRequest(async () => 
        await apiClient.get<ApiResponse<NewsCategory[]>>(`/data?type=categories&language_id=${language_id}`)
      );
      return response.data.result || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories for language ${language_id}. Please try again later.`);
    }
  },

  // 3. States List
  async getStates(language_id: string): Promise<State[]> {
    try {
      const response = await retryRequest(async () =>
        await apiClient.get<StatesApiResponse>(`/data?type=states&language_id=${language_id}`)
      );
      const result = response.data.result;
      const items = Array.isArray(result) ? result : result?.items || [];
      return items.map((s: StateApiItem) => ({
        id: s.id,
        stateName: s.name,
        language_id: s.language_id,
        isDeleted: s.isDeleted ? 1 : 0,
        is_active: s.is_active ? 1 : 0,
      }));
    } catch (error: any) {
      console.error('Error fetching states:', error);
      throw new Error(`Failed to fetch states for language ${language_id}. Please try again later.`);
    }
  },

  // 4. Districts List
  async getDistricts(language_id: string): Promise<District[]> {
    try {
      const response = await retryRequest(async () => 
        await apiClient.get<ApiResponse<District[]>>(`/data?type=districts&language_id=${language_id}`)
      );
      return response.data.result?.filter(district => district.isDeleted !== 1) || [];
    } catch (error: any) {
      console.error('Error fetching districts:', error);
      throw new Error(`Failed to fetch districts for language ${language_id}. Please try again later.`);
    }
  },

  // 5. Local Mandi Categories
  async getLocalMandiCategories(): Promise<LocalMandiCategory[]> {
    try {
      const response = await retryRequest(async () => 
        await apiClient.get<ApiResponse<{ items: LocalMandiCategory[] }>>('/local-mandi-categories')
      );
      return response.data.result?.items || [];
    } catch (error: any) {
      console.error('Error fetching local mandi categories:', error);
      return [];
    }
  },

  // Breaking News Section
  async getBreakingNews(): Promise<NewsItem[]> {
    try {
      const response = await retryRequest(async () => 
        await apiClient.get<ApiResponse<PaginatedResponse<NewsItem>>>('/news/filter-advanced')
      );
      return response.data.result?.items || [];
    } catch (error: any) {
      console.error('Error fetching breaking news:', error);
      throw new Error('Failed to fetch breaking news. Please try again later.');
    }
  }
};

// Fetch urgency patterns for breaking news
export const fetchUrgencyPatterns = async (): Promise<Record<string, string[]>> => {
  try {
    const res = await apiClient.get('', {
      params: { 
        type: 'urgency-patterns'
      }
    });
    
    console.log(`[fetchUrgencyPatterns] Fetched urgency patterns:`, res.data);
    
    if ((res.data as any).status === 1 && (res.data as any).result) {
      return (res.data as any).result;
    } else {
      console.log(`[fetchUrgencyPatterns] No urgency patterns found`);
      return {};
    }
  } catch (err) {
    console.error(`[fetchUrgencyPatterns] Error fetching urgency patterns:`, err);
    return {};
  }
};

// Fetch category keywords for all languages
export const fetchCategoryKeywords = async (): Promise<Record<string, Record<string, string[]>>> => {
  try {
    const res = await apiClient.get('', {
      params: { 
        type: 'category-keywords'
      }
    });
    
    console.log(`[fetchCategoryKeywords] Fetched category keywords:`, res.data);
    
    if ((res.data as any).status === 1 && (res.data as any).result) {
      return (res.data as any).result;
    } else {
      console.log(`[fetchCategoryKeywords] No category keywords found`);
      return {};
    }
  } catch (err) {
    console.error(`[fetchCategoryKeywords] Error fetching category keywords:`, err);
    return {};
  }
};

// Export the centralized API client
export default apiClient;
