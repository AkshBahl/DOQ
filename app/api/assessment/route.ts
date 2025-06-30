import { NextRequest, NextResponse } from 'next/server'
import { assessHealthSymptoms } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { symptoms, painLevel, duration, medicationsTaken, additionalSymptoms, userId } = await request.json()

    // Validate required fields
    if (!symptoms || !painLevel || !duration || !medicationsTaken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get AI assessment from Gemini
    const assessment = await assessHealthSymptoms({
      symptoms,
      painLevel,
      duration,
      medicationsTaken,
      additionalSymptoms,
    })

    // Save assessment to database if user is authenticated
    if (userId) {
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          symptoms,
          pain_level: painLevel,
          duration,
          medications_taken: medicationsTaken,
          additional_symptoms: additionalSymptoms,
          urgency_level: assessment.urgencyLevel,
          confidence_score: assessment.confidenceScore,
          recommendations: assessment.recommendations,
        })

      if (error) {
        console.error('Database error:', error)
      }
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Assessment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 