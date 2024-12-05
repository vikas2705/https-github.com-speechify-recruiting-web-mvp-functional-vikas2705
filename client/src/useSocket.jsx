import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const serverURL = "ws://localhost:8080";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [transcriptions, setTranscriptions] = useState('');
  const [isTranscriberReady, setIsTranscriberReady] = useState(false);
  const [error, setError] = useState(null);

  const initialize = useCallback(() => {
    const newSocket = io(serverURL);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("transcriber-ready", () => {
      setIsTranscriberReady(true);
    });

    newSocket.on("final", (data) => {
      setTranscriptions((prev) => prev+data.channel.alternatives[0].transcript);
    });

    newSocket.on("partial", (data) => {
      console.log("Partial transcription received:", data);
    });

    newSocket.on("error", (error) => {
      setError(error);
    });

    newSocket.on("disconnect", () => {
      setIsTranscriberReady(false);
    });

    setSocket(newSocket);
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendAudio = useCallback(
    (audioData) => {
      if (socket && socket.connected) {
        socket.emit("incoming-audio", audioData);
      } else {
        console.warn("Socket is not connected. Cannot send audio data.");
      }
    },
    [socket]
  );

  return {
    initialize,
    disconnect,
    sendAudio,
    transcriptions,
    isTranscriberReady,
    error,
  };
};

export default useSocket;
