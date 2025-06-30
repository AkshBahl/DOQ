import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
        allergies: profileData.allergies ? JSON.parse(profileData.allergies) : [],
        medications: profileData.current_medications ? JSON.parse(profileData.current_medications) : [],
        conditions: profileData.medical_conditions ? JSON.parse(profileData.medical_conditions) : [],
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