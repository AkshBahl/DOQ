import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function safeParseArray(val: any) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return typeof val === 'string' ? [val] : [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, profileData } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Insert or update user profile
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        address: profileData.address,
        emergency_contact: profileData.emergency_contact,
        subscription_tier: profileData.subscription_tier || 'free',
        health_score: 0,
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
    }

    // Create health profile if health information is provided
    if (profileData.allergies || profileData.current_medications || profileData.medical_conditions) {
      const healthProfileData = {
        user_id: userId,
        allergies: safeParseArray(profileData.allergies),
        medications: safeParseArray(profileData.current_medications),
        conditions: safeParseArray(profileData.medical_conditions),
        health_goals: profileData.health_goals || '',
      }

      const { error: healthError } = await supabase
        .from('health_profiles')
        .upsert(healthProfileData, {
          onConflict: 'user_id'
        })

      if (healthError) {
        console.error('Health profile error:', healthError)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 