import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })

export interface HealthAssessmentRequest {
  symptoms: string
  painLevel: string
  duration: string
  medicationsTaken: string
  additionalSymptoms?: string
}

export interface HealthAssessmentResponse {
  urgencyLevel: 'mild' | 'moderate' | 'severe'
  confidenceScore: number
  recommendations: string
  timeline: string
}

export async function assessHealthSymptoms(request: HealthAssessmentRequest): Promise<HealthAssessmentResponse> {
  const prompt = `
You are a medical AI assistant. Analyze the following symptoms and provide a health assessment:

Symptoms: ${request.symptoms}
Pain Level: ${request.painLevel}
Duration: ${request.duration}
Medications Taken: ${request.medicationsTaken}
Additional Symptoms: ${request.additionalSymptoms || 'None'}

Please provide:
1. Urgency Level (mild/moderate/severe)
2. Confidence Score (0-100)
3. Detailed recommendations
4. Recommended timeline for medical consultation

Respond in JSON format:
{
  "urgencyLevel": "moderate",
  "confidenceScore": 75,
  "recommendations": "Detailed recommendations here...",
  "timeline": "1-2 days"
}
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    // Fallback response
    return {
      urgencyLevel: 'moderate',
      confidenceScore: 70,
      recommendations: 'Please consult with a healthcare provider for proper evaluation.',
      timeline: '1-2 days'
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      urgencyLevel: 'moderate',
      confidenceScore: 50,
      recommendations: 'Unable to process assessment. Please consult a healthcare provider.',
      timeline: '1-2 days'
    }
  }
}

export async function generateHealthResponse(userMessage: string): Promise<string> {
  const prompt = `
You are a helpful AI health assistant. Provide accurate, helpful, and safe health information. 
Remember: You cannot diagnose, prescribe, or replace professional medical advice.

User question: ${userMessage}

Provide a helpful response that:
1. Addresses the user's question
2. Provides general health information
3. Encourages professional consultation when appropriate
4. Is clear and easy to understand
`

  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    return 'I apologize, but I\'m unable to process your request at the moment. Please try again or consult with a healthcare provider for immediate concerns.'
  }
} 