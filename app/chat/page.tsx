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
  const [currentMode, setCurrentMode] = useState<'text' | 'voice'>("text")
  const [voiceStatus, setVoiceStatus] = useState("")
  const [isAvatarReady, setIsAvatarReady] = useState(false)

  // Initialize avatar on mount
  useEffect(() => {
    avatarRef.current?.initialize()
  }, [])

  useEffect(() => {
    if (avatarRef.current) {
      setIsAvatarReady(!!avatarRef.current.isReady)
      setVoiceStatus(avatarRef.current.voiceStatus || "")
    }
  }, [avatarRef.current?.isReady, avatarRef.current?.voiceStatus])

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

  const handleSwitchMode = async (mode: 'text' | 'voice') => {
    if (currentMode === mode) return
    setCurrentMode(mode)
    if (mode === 'text') {
      await avatarRef.current?.closeVoiceChat()
    } else {
      await avatarRef.current?.startVoiceChat()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4">AI Doctor </h2>
          <div className="w-full h-80 mb-4">
            <StreamingAvatarComponent ref={avatarRef} />
          </div>
          <div className="chat-modes flex gap-2 mb-2" role="group">
            <Button
              id="textModeBtn"
              className={currentMode === 'text' ? 'active' : ''}
              onClick={() => handleSwitchMode('text')}
              disabled={currentMode === 'text'}
            >Text Mode</Button>
            <Button
              id="voiceModeBtn"
              className={currentMode === 'voice' ? 'active' : ''}
              onClick={() => handleSwitchMode('voice')}
              disabled={!isAvatarReady || currentMode === 'voice'}
            >Voice Mode</Button>
          </div>
          {currentMode === 'text' && (
            <div id="textModeControls" className="w-full flex gap-2 mt-2">
              <Input
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || avatarRef.current?.isSpeaking}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim() || avatarRef.current?.isSpeaking}
              >Send</Button>
            </div>
          )}
          {currentMode === 'voice' && (
            <section id="voiceModeControls" role="group" className="w-full mt-2">
              <div id="voiceStatus" className="text-blue-600">{voiceStatus}</div>
            </section>
          )}
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </div>
      </main>
    </div>
  )
}