"use client"

import { useEffect, useRef, useState } from "react"
import Navigation from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StreamingAvatarComponent from "@/components/StreamingAvatarComponent"

export default function ChatPage() {
  const avatarRef = useRef<any>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize avatar on mount
  useEffect(() => {
    avatarRef.current?.initialize()
  }, [])

  const handleSend = async () => {
    if (!avatarRef.current || !inputMessage.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await avatarRef.current.speak(inputMessage)
      setInputMessage("")
    } catch (e) {
      setError("Failed to send message to avatar.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get error from avatar component if any
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
          <div className="flex w-full gap-2 mt-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) handleSend()
              }}
              disabled={isLoading || avatarRef.current?.isSpeaking}
            />
            <Button onClick={handleSend} disabled={!inputMessage.trim() || isLoading || avatarRef.current?.isSpeaking}>
              Send
            </Button>
          </div>
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
        </div>
      </main>
    </div>
  )
}