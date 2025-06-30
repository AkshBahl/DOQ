import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact?: string
  subscription_tier: 'free' | 'premium' | 'family'
  health_score?: number
  created_at: string
  updated_at: string
}

export interface HealthProfile {
  id: string
  user_id: string
  allergies: Allergy[]
  medications: Medication[]
  conditions: Condition[]
  created_at: string
  updated_at: string
}

export interface Allergy {
  id: string
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction: string
  date_identified: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  prescribed_by: string
  start_date: string
}

export interface Condition {
  id: string
  name: string
  diagnosed_date: string
  status: 'active' | 'resolved' | 'managed'
  notes: string
}

export interface Assessment {
  id: string
  user_id: string
  symptoms: string
  pain_level: string
  duration: string
  medications_taken: string
  additional_symptoms?: string
  urgency_level: 'mild' | 'moderate' | 'severe'
  confidence_score: number
  recommendations: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  type: 'user' | 'ai'
  content: string
  confidence?: number
  created_at: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  rating: number
  review_count: number
  distance: string
  address: string
  phone: string
  image: string
  accepts_insurance: boolean
  next_available: string
  languages: string[]
  education: string
  experience: string
} 