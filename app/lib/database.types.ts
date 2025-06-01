export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          title: string
          abstract: string | null
          authors: Json
          year: number | null
          topics: Json
          pdf_url: string
          pdf_file_path: string | null
          full_text: string | null
          citations: number
          institution: string | null
          impact_score: number
          processing_status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          title: string
          abstract?: string | null
          authors?: Json
          year?: number | null
          topics?: Json
          pdf_url: string
          pdf_file_path?: string | null
          full_text?: string | null
          citations?: number
          institution?: string | null
          impact_score?: number
          processing_status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          title?: string
          abstract?: string | null
          authors?: Json
          year?: number | null
          topics?: Json
          pdf_url?: string
          pdf_file_path?: string | null
          full_text?: string | null
          citations?: number
          institution?: string | null
          impact_score?: number
          processing_status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      paper_chunks: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          chunk_id: string
          content: string
          page_number: number | null
          section: string | null
          chunk_index: number | null
          bbox: Json | null
          embedding: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          chunk_id: string
          content: string
          page_number?: number | null
          section?: string | null
          chunk_index?: number | null
          bbox?: Json | null
          embedding?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          chunk_id?: string
          content?: string
          page_number?: number | null
          section?: string | null
          chunk_index?: number | null
          bbox?: Json | null
          embedding?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      highlights: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          highlight_text: string
          page_number: number
          position: Json
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          highlight_text: string
          page_number: number
          position: Json
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          highlight_text?: string
          page_number?: number
          position?: Json
          color?: string
          created_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          user_id: string
          paper_id: string
          highlight_id: string | null
          content: string
          annotation_type: string
          page_number: number | null
          position: Json | null
          tags: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id: string
          highlight_id?: string | null
          content: string
          annotation_type?: string
          page_number?: number | null
          position?: Json | null
          tags?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string
          highlight_id?: string | null
          content?: string
          annotation_type?: string
          page_number?: number | null
          position?: Json | null
          tags?: Json
          created_at?: string
          updated_at?: string
        }
      }
      concepts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          concept_type: string
          color: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          concept_type?: string
          color?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          concept_type?: string
          color?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_id: string
          source_type: string
          source_id: string
          target_type: string
          target_id: string
          connection_type: string
          strength: number
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_type: string
          source_id: string
          target_type: string
          target_id: string
          connection_type?: string
          strength?: number
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_type?: string
          source_id?: string
          target_type?: string
          target_id?: string
          connection_type?: string
          strength?: number
          description?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      concept_links: {
        Row: {
          id: string
          user_id: string
          concept_id: string
          entity_type: string
          entity_id: string
          relevance_score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          concept_id: string
          entity_type: string
          entity_id: string
          relevance_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          concept_id?: string
          entity_type?: string
          entity_id?: string
          relevance_score?: number
          created_at?: string
        }
      }
      canvases: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          canvas_data: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          canvas_data?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          canvas_data?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      canvas_items: {
        Row: {
          id: string
          user_id: string
          canvas_id: string
          item_type: string
          entity_id: string | null
          position: Json
          size: Json
          style: Json
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          canvas_id: string
          item_type: string
          entity_id?: string | null
          position: Json
          size?: Json
          style?: Json
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          canvas_id?: string
          item_type?: string
          entity_id?: string | null
          position?: Json
          size?: Json
          style?: Json
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          paper_id: string | null
          session_name: string | null
          session_type: string
          context: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_id?: string | null
          session_name?: string | null
          session_type?: string
          context?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_id?: string | null
          session_name?: string | null
          session_type?: string
          context?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          session_id: string
          role: string
          content: string
          message_type: string
          sources: Json
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          role: string
          content: string
          message_type?: string
          sources?: Json
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          role?: string
          content?: string
          message_type?: string
          sources?: Json
          metadata?: Json
          created_at?: string
        }
      }
      research_chains: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          chain_type: string
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          chain_type?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          chain_type?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      research_events: {
        Row: {
          id: string
          user_id: string
          chain_id: string
          event_type: string
          entity_type: string | null
          entity_id: string | null
          description: string | null
          event_data: Json
          sequence_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chain_id: string
          event_type: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          event_data?: Json
          sequence_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chain_id?: string
          event_type?: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          event_data?: Json
          sequence_order?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      get_enhanced_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      search_user_content: {
        Args: {
          p_user_id: string
          p_query: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 