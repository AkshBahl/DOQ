"use client"

import { useEffect, useRef, useState } from "react"
import Navigation from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StreamingAvatarComponent from "@/components/StreamingAvatarComponent"
import { Mic, MicOff } from "lucide-react"

export default function ChatPage() {
  const avatarRef = useRef<any>(null)
  const [isAvatarStarted, setIsAvatarStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voiceStatus, setVoiceStatus] = useState("")
  const [isAvatarReady, setIsAvatarReady] = useState(false)

  useEffect(() => {
    if (avatarRef.current) {
      console.log("avatarRef became available:", avatarRef.current);
    }
  }, [avatarRef.current]);

  const handleStartAvatar = async () => {
    console.log("Start Avatar button clicked");
    setIsLoading(true);
    setError(null);
    try {
      console.log("avatarRef.current:", avatarRef.current);
      await avatarRef.current?.initialize();
      setIsAvatarStarted(true);
    } catch (e) {
      setError("Failed to start avatar.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (avatarRef.current) {
      setIsAvatarReady(!!avatarRef.current.isReady)
      setVoiceStatus(avatarRef.current.voiceStatus || "")
    }
  }, [avatarRef.current?.isReady, avatarRef.current?.voiceStatus])

  useEffect(() => {
    if (avatarRef.current && avatarRef.current.error) {
      setError(avatarRef.current.error)
    }
  }, [avatarRef.current?.error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 px-2 sm:px-4 w-full">
        <div className="w-full max-w-full sm:max-w-2xl bg-white rounded-lg shadow-lg p-4 sm:p-6 flex flex-col items-center">
          <h2 className="text-lg sm:text-xl font-bold mb-4">AI Doctor </h2>
          <div className="w-full h-60 sm:h-80 mb-4">
            <StreamingAvatarComponent ref={avatarRef} />
          </div>
          {!isAvatarStarted ? (
            <Button
              onClick={handleStartAvatar}
              disabled={isLoading}
              className="mb-4 px-8 py-4 text-lg"
            >
              {isLoading ? "Starting Avatar..." : "Start Avatar"}
            </Button>
          ) : (
            <>
              <section id="voiceModeControls" role="group" className="w-full mt-2">
                <div id="voiceStatus" className="text-blue-600">{voiceStatus}</div>
              </section>
            </>
          )}
          {error && (
            <div className="text-red-500 mt-4">{error}</div>
          )}
          {avatarRef.current && (
            <button
              onClick={() => avatarRef.current?.startVoiceChat()}
              disabled={!avatarRef.current?.isReady}
              style={{ marginTop: 16 }}
            >
              Start Voice Chat
            </button>
          )}
        </div>
      </main>
    </div>
  )
}