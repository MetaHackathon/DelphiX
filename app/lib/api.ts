// API client for DataEngineX backend
const API_BASE_URL = typeof window !== 'undefined' 
  ? 'http://localhost:8000'  // Client-side default
  : process.env.DATAENGINEX_API_URL || 'http://localhost:8000'; // Server-side with env fallback

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Paper discovery
  async searchPapers(query: string, limit: number = 10, start: number = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      start: start.toString(),
    });
    return this.request(`/api/discover?${params}`);
  }

  async getTrendingPapers(limit: number = 20) {
    return this.request(`/api/discover/trending?limit=${limit}`);
  }

  async getRecommendedPapers(limit: number = 15) {
    return this.request(`/api/discover/recommended?limit=${limit}`);
  }

  // Library management
  async getLibrary() {
    return this.request('/api/library');
  }

  async uploadPaper(formData: FormData) {
    const response = await fetch(`${this.baseUrl}/api/library/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Search functionality
  async searchLibrary(query: string, searchIn: string[] = ['papers', 'annotations', 'highlights'], limit: number = 20) {
    return this.request('/api/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        search_in: searchIn,
        limit,
      }),
    });
  }

  async quickSearch(query: string) {
    const params = new URLSearchParams({ q: query });
    return this.request(`/api/search/quick?${params}`);
  }

  // Chat functionality
  async createChatSession(data: { session_type?: string; session_name?: string; paper_id?: string }) {
    return this.request('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendChatMessage(sessionId: string, message: string, includeContext: boolean = true) {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        message,
        include_context: includeContext,
      }),
    });
  }

  // Stats
  async getLibraryStats() {
    return this.request('/api/stats');
  }

  async getDashboard() {
    return this.request('/api/dashboard');
  }

  // ============================================================================
  // KNOWLEDGEBASE MANAGEMENT
  // ============================================================================

  // Get all knowledgebases for the current user
  async getKnowledgebases() {
    return this.request('/api/knowledgebases');
  }

  // Create a new knowledgebase
  async createKnowledgebase(data: {
    name: string;
    description?: string;
    papers: string[];
    tags?: string[];
    is_public?: boolean;
  }) {
    return this.request('/api/knowledgebases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get a specific knowledgebase by ID
  async getKnowledgebase(id: string) {
    return this.request(`/api/knowledgebases/${id}`);
  }

  // Update a knowledgebase
  async updateKnowledgebase(id: string, data: {
    name?: string;
    description?: string;
    papers?: string[];
    tags?: string[];
    is_public?: boolean;
  }) {
    return this.request(`/api/knowledgebases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a knowledgebase
  async deleteKnowledgebase(id: string) {
    return this.request(`/api/knowledgebases/${id}`, {
      method: 'DELETE',
    });
  }

  // Add papers to a knowledgebase
  async addPapersToKnowledgebase(id: string, paperIds: string[]) {
    return this.request(`/api/knowledgebases/${id}/papers`, {
      method: 'POST',
      body: JSON.stringify({ paper_ids: paperIds }),
    });
  }

  // Remove papers from a knowledgebase
  async removePapersFromKnowledgebase(id: string, paperIds: string[]) {
    return this.request(`/api/knowledgebases/${id}/papers`, {
      method: 'DELETE',
      body: JSON.stringify({ paper_ids: paperIds }),
    });
  }

  // Get papers in a knowledgebase
  async getKnowledgebasePapers(id: string) {
    return this.request(`/api/knowledgebases/${id}/papers`);
  }

  // Generate insights for a knowledgebase
  async generateKnowledgebaseInsights(id: string) {
    return this.request(`/api/knowledgebases/${id}/insights`, {
      method: 'POST',
    });
  }

  // Export knowledgebase
  async exportKnowledgebase(id: string, format: 'json' | 'csv' | 'bibtex' = 'json') {
    const params = new URLSearchParams({ format });
    return this.request(`/api/knowledgebases/${id}/export?${params}`);
  }

  // Share/collaborate on knowledgebase
  async shareKnowledgebase(id: string, data: {
    email?: string;
    permissions: 'read' | 'write' | 'admin';
    public_link?: boolean;
  }) {
    return this.request(`/api/knowledgebases/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // DOCUMENT VIEWING AND ANNOTATIONS
  // ============================================================================

  // Get document metadata
  async getDocument(id: string) {
    return this.request(`/api/documents/${id}`);
  }

  // Get document highlights and annotations
  async getDocumentAnnotations(documentId: string) {
    return this.request(`/api/documents/${documentId}/annotations`);
  }

  // Save highlight
  async saveHighlight(documentId: string, highlight: {
    content: { text?: string; image?: string };
    position: any;
    color?: string;
    type?: string;
    comment?: string;
  }) {
    return this.request(`/api/documents/${documentId}/highlights`, {
      method: 'POST',
      body: JSON.stringify(highlight),
    });
  }

  // Update highlight
  async updateHighlight(documentId: string, highlightId: string, updates: {
    comment?: string;
    color?: string;
  }) {
    return this.request(`/api/documents/${documentId}/highlights/${highlightId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete highlight
  async deleteHighlight(documentId: string, highlightId: string) {
    return this.request(`/api/documents/${documentId}/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  // Save annotation
  async saveAnnotation(documentId: string, annotation: {
    type: 'note' | 'bookmark' | 'comment';
    content: string;
    page: number;
    position?: any;
  }) {
    return this.request(`/api/documents/${documentId}/annotations`, {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  }

  // Document chat
  async sendDocumentChatMessage(documentId: string, message: string, context?: {
    highlights?: string[];
    page?: number;
  }) {
    return this.request(`/api/documents/${documentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
      }),
    });
  }

  // Get document chat history
  async getDocumentChatHistory(documentId: string) {
    return this.request(`/api/documents/${documentId}/chat`);
  }
}

export const apiClient = new ApiClient(); 