import { NextRequest, NextResponse } from 'next/server'
import { generateHealthResponse } from '@/lib/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Generate AI response using Gemini
    const aiResponse = await generateHealthResponse(message)

    // Save chat messages to database if user is authenticated
    if (userId) {
      // Save user message
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          type: 'user',
          content: message,
        })

      // Save AI response
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          type: 'ai',
          content: aiResponse,
          confidence: 85, // Default confidence for chat responses
        })
    }

    return NextResponse.json({ 
      response: aiResponse,
      confidence: 85
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 