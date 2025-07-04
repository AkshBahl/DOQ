"use client";

import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
} from "@heygen/streaming-avatar";

interface StreamingAvatarComponentProps {
  avatarName?: string;
  language?: string;
}

const DEFAULT_AVATAR_NAME = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_NAME || "Wayne_20240711";

const StreamingAvatarComponent = forwardRef((props: StreamingAvatarComponentProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatar, setAvatar] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>("");

  const fetchAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/heygen-token", { method: "POST" });
      const { token, error } = await response.json();
      if (!token) {
        setError(error || "Failed to fetch HeyGen token.");
        return null;
      }
      return token;
    } catch (err) {
      setError("Failed to fetch HeyGen token.");
      return null;
    }
  };

  const initialize = async () => {
    setError(null);
    setIsReady(false);
    const token = await fetchAccessToken();
    if (!token) {
      alert("Failed to fetch HeyGen token. Please try again later or contact support.");
      return;
    }
    const avatarInstance = new StreamingAvatar({ token });
    setAvatar(avatarInstance);

    avatarInstance.on(StreamingEvents.STREAM_READY, (event: any) => {
      if (event.detail && videoRef.current) {
        videoRef.current.srcObject = event.detail.stream || event.detail;
        videoRef.current.play();
        setIsReady(true);
      }
    });

    avatarInstance.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsReady(false);
    });

    avatarInstance.on(StreamingEvents.USER_START, () => {
      setVoiceStatus("Listening...");
    });
    avatarInstance.on(StreamingEvents.USER_STOP, () => {
      setVoiceStatus("Processing...");
    });
    avatarInstance.on(StreamingEvents.AVATAR_START_TALKING, () => {
      setVoiceStatus("Avatar is speaking...");
    });
    avatarInstance.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      setVoiceStatus("Waiting for you to speak...");
    });

    await avatarInstance.createStartAvatar({
      quality: AvatarQuality.High,
      avatarName: props.avatarName || DEFAULT_AVATAR_NAME,
      language: props.language || "en",
      disableIdleTimeout: true,
    });
  };

  // Speak with 1 retry if first call fails
  const speak = async (text: string): Promise<{ duration_ms?: number; task_id?: string }> => {
    if (!avatar || !text) return {};
    setIsSpeaking(true);
    const trySpeak = async () => {
      try {
        const result = await avatar.speak({
          text,
          taskType: TaskType.TALK,
        });
        return result; // contains { duration_ms, task_id }
      } catch (err) {
        console.error("Avatar speak error:", err);
        return null;
      }
    };
    let result = await trySpeak();
    // Retry once after 5s if first attempt fails
    if (!result) {
      await new Promise((res) => setTimeout(res, 5000));
      result = await trySpeak();
    }
    setIsSpeaking(false);
    return result || {}; // fallback to empty object if still failed
  };

  const interrupt = async () => {
    if (avatar) {
      try {
        await avatar.interrupt();
      } catch (err) {
        console.error("Error while interrupting avatar:", err);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const startVoiceChat = async () => {
    if (!avatar) return;
    try {
      await avatar.startVoiceChat({ useSilencePrompt: false });
      setVoiceStatus("Waiting for you to speak...");
    } catch (error) {
      setVoiceStatus("Error starting voice chat");
    }
  };

  const closeVoiceChat = async () => {
    if (!avatar) return;
    try {
      await avatar.closeVoiceChat();
      setVoiceStatus("");
    } catch (error) {
      setVoiceStatus("Error closing voice chat");
    }
  };

  useImperativeHandle(ref, () => ({
    initialize,
    speak, // returns { duration_ms, task_id }
    cancel: interrupt,
    isSpeaking,
    isReady,
    error,
    startVoiceChat,
    closeVoiceChat,
    voiceStatus,
  }));

  return (
    <div className="w-full h-full px-2">
      <div
        className="relative w-full h-full rounded-xl border shadow-md overflow-hidden bg-white flex items-center justify-center"
        style={{ height: "100%", minHeight: "100%" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-xl transition-opacity duration-300 bg-transparent"
          style={{
            zIndex: 2,
            background: "transparent",
            pointerEvents: "none",
          }}
        />
        {(!isReady || !videoRef.current || !videoRef.current.srcObject) && (
          <div className="flex flex-col items-center justify-center w-full h-full z-1">
            <div
              className="rounded-full bg-gray-100 flex items-center justify-center"
              style={{ width: 72, height: 72 }}
            >
              <svg
                width="40"
                height="40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="text-eoxs-green"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-7-4m7 4l7-4"
                />
              </svg>
            </div>
            <span className="mt-2 text-gray-500 text-xs">Avatar will appear here</span>
            {error && <span className="text-red-500 text-xs mt-2">{error}</span>}
          </div>
        )}
      </div>
    </div>
  );
});

StreamingAvatarComponent.displayName = "StreamingAvatarComponent";
export default StreamingAvatarComponent; 