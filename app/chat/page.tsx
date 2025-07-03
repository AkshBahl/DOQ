"use client"

import { useEffect, useRef, useState } from "react"
import Navigation from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StreamingAvatarComponent from "@/components/StreamingAvatarComponent"
import { Mic, MicOff } from "lucide-react"

export default function ChatPage() {
  const avatarRef = useRef<any>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize avatar on mount
  useEffect(() => {
    avatarRef.current?.initialize()
  }, [])

  // --- Speech-to-Text (STT) ---
  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError("Speech recognition is not supported in this browser.")
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      setIsLoading(true)
      setError(null)
      try {
        await avatarRef.current.speak(transcript)
      } catch (e) {
        setError("Failed to send message to avatar.")
      } finally {
        setIsLoading(false)
      }
    }
    recognition.onerror = (event: any) => {
      setError("Speech recognition error: " + event.error)
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
    }
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }
  const handleStopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // --- Text-to-Speech (TTS) ---
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSend = async () => {
    if (!avatarRef.current || !inputMessage.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await avatarRef.current.speak(inputMessage)
      // Speak the AI's response aloud (simulate with inputMessage for now)
      speakText(inputMessage)
      setInputMessage("")
    } catch (e) {
      setError("Failed to send message to avatar.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get error from avatar component if any l
  useEffect(() => {
    if (avatarRef.current && avatarRef.current.error) {
      setError(avatarRef.current.error)
    }
  }, [avatarRef.current?.error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4">AI Doctor </h2>
          <div className="w-full h-80 mb-4">
            <StreamingAvatarComponent ref={avatarRef} />
          </div>
          <div className="flex w-full gap-2 mt-2 justify-center">
            <Button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              variant={isListening ? "destructive" : "outline"}
              disabled={isLoading || avatarRef.current?.isSpeaking}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
          </div>
          {isListening && (
            <div className="text-blue-600 mt-2">Listening... Speak now!</div>
          )}
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </div>
      </main>
    </div>
  )
}