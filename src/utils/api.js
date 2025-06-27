// API Client for Render Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://voice-of-bharat-api.onrender.com/api';

// Log which API URL is being used
console.log('🔗 API Client initialized with URL:', API_BASE_URL);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Log API calls for debugging
    console.log('🌐 Making API call to:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Articles API
  async getArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/articles${queryString ? `?${queryString}` : ''}`);
  }

  async getArticle(id) {
    return this.get(`/articles/${id}`);
  }

  async getArticleById(id) {
    return this.get(`/articles/id/${id}`);
  }

  async createArticle(articleData) {
    return this.post('/articles', articleData);
  }

  async updateArticle(id, articleData) {
    return this.put(`/articles/${id}`, articleData);
  }

  async deleteArticle(id) {
    return this.delete(`/articles/${id}`);
  }

  async getBreakingNews() {
    return this.get('/articles?breaking_news=true');
  }

  async getFeaturedArticles() {
    return this.get('/articles?featured=true');
  }

  // Categories API
  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(id) {
    return this.get(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.post('/categories', categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.delete(`/categories/${id}`);
  }

  // States API
  async getStates() {
    return this.get('/states');
  }

  async getState(id) {
    return this.get(`/states/${id}`);
  }

  async createState(stateData) {
    return this.post('/states', stateData);
  }

  async updateState(id, stateData) {
    return this.put(`/states/${id}`, stateData);
  }

  async deleteState(id) {
    return this.delete(`/states/${id}`);
  }

  // Videos API
  async getVideos() {
    return this.get('/videos');
  }

  async getVideo(id) {
    return this.get(`/videos/${id}`);
  }

  async createVideo(videoData) {
    return this.post('/videos', videoData);
  }

  async updateVideo(id, videoData) {
    return this.put(`/videos/${id}`, videoData);
  }

  async deleteVideo(id) {
    return this.delete(`/videos/${id}`);
  }

  // Live Streams API
  async getLiveStreams() {
    return this.get('/live-streams');
  }

  async getActiveLiveStreams() {
    return this.get('/live-streams?active=true');
  }

  async createLiveStream(streamData) {
    return this.post('/live-streams', streamData);
  }

  async updateLiveStream(id, streamData) {
    return this.put(`/live-streams/${id}`, streamData);
  }

  async deleteLiveStream(id) {
    return this.delete(`/live-streams/${id}`);
  }

  // Newsletter API
  async subscribeNewsletter(email) {
    return this.post('/newsletter/subscribe', { email });
  }

  async getNewsletterSubscriptions() {
    return this.get('/newsletter');
  }

  async deleteNewsletterSubscription(id) {
    return this.delete(`/newsletter/${id}`);
  }

  // About API
  async getAboutContent() {
    return this.get('/about');
  }

  async updateAboutContent(content) {
    return this.put('/about', content);
  }

  async getTeamMembers() {
    return this.get('/team-members');
  }

  async createTeamMember(memberData) {
    return this.post('/team-members', memberData);
  }

  async updateTeamMember(id, memberData) {
    return this.put(`/team-members/${id}`, memberData);
  }

  async deleteTeamMember(id) {
    return this.delete(`/team-members/${id}`);
  }

  // Support API
  async getSupportDetails() {
    return this.get('/support');
  }

  async updateSupportDetails(details) {
    return this.put('/support', details);
  }

  // Socials API
  async getSocialLinks() {
    return this.get('/socials');
  }

  async updateSocialLinks(links) {
    return this.put('/socials', links);
  }

  // Analytics API
  async trackPageView(pageData) {
    return this.post('/analytics/page-view', pageData);
  }

  async trackEvent(eventData) {
    return this.post('/analytics/event', eventData);
  }

  async getAnalytics() {
    return this.get('/analytics');
  }

  // Ads API
  async getAds() {
    return this.get('/ads');
  }

  async createAd(adData) {
    return this.post('/ads', adData);
  }

  async updateAd(id, adData) {
    return this.put(`/ads/${id}`, adData);
  }

  async deleteAd(id) {
    return this.delete(`/ads/${id}`);
  }

  // Profiles API
  async getProfiles() {
    return this.get('/profiles');
  }

  async getProfile(id) {
    return this.get(`/profiles/${id}`);
  }

  async updateProfile(id, profileData) {
    return this.put(`/profiles/${id}`, profileData);
  }

  async deleteProfile(id) {
    return this.delete(`/profiles/${id}`);
  }

  // Health API
  async getHealth() {
    return this.get('/health');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient; 