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
      about_us_stats: {
        Row: {
          id: number
          created_at: string
          title: string
          value: string
          icon: string
          order: number
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          value: string
          icon: string
          order?: number
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          value?: string
          icon?: string
          order?: number
        }
      }
      contact_messages: {
        Row: {
          id: number
          created_at: string
          first_name: string
          last_name: string
          email: string
          service: string
          message: string
          status: 'new' | 'read' | 'replied'
          phone_number: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          first_name: string
          last_name: string
          email: string
          service: string
          message: string
          status?: 'new' | 'read' | 'replied'
          phone_number?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          service?: string
          message?: string
          status?: 'new' | 'read' | 'replied'
          phone_number?: string | null
        }
      }
      gallery_items: {
        Row: {
          id: number
          created_at: string
          title: string
          description: string
          image_url: string
          category: string
          order: number
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          description: string
          image_url: string
          category: string
          order?: number
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          description?: string
          image_url?: string
          category?: string
          order?: number
        }
      }
      stats: {
        Row: {
          id: number
          created_at: string
          daily_usage: number
          sun_hours: number
          backup_days: number
          efficiency: number
          solar_size: number
          battery_size: number
          inverter_size: number
        }
        Insert: {
          id?: number
          created_at?: string
          daily_usage: number
          sun_hours: number
          backup_days: number
          efficiency: number
          solar_size: number
          battery_size: number
          inverter_size: number
        }
        Update: {
          id?: number
          created_at?: string
          daily_usage?: number
          sun_hours?: number
          backup_days?: number
          efficiency?: number
          solar_size?: number
          battery_size?: number
          inverter_size?: number
        }
      }
      testimonials: {
        Row: {
          id: number
          created_at: string
          name: string
          role: string
          content: string
          image_url: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          role: string
          content: string
          image_url: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          role?: string
          content?: string
          image_url?: string
        }
      }
    }
  }
}