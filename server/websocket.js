import Transcriber from "./transcriber.js"; 

/**
 * Events to subscribe to:
 * - connection: Triggered when a client connects to the server.
 * - configure-stream: Requires an object with a 'sampleRate' property.
 * - incoming-audio: Requires audio data as the parameter.
 * - stop-stream: Triggered when the client requests to stop the transcription stream.
 * - disconnect: Triggered when a client disconnects from the server.
 *
 * Events to emit:
 * - transcriber-ready: Emitted when the transcriber is ready.
 * - final: Emits the final transcription result (string).
 * - partial: Emits the partial transcription result (string).
 * - error: Emitted when an error occurs.
 */

const initializeWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const transcriber = new Transcriber(io); 

    let isTranscriptionActive = false;

    socket.on("configure-stream", (config) => {
      if (isTranscriptionActive) {
        console.log("Transcription is already active.");
        return; 
      }

      const { sampleRate } = config;
      transcriber.startTranscriptionStream(config); 

      isTranscriptionActive = true; 

      transcriber.on("transcriber-ready", () => {
        socket.emit("transcriber-ready");
      });
    });

    socket.on("incoming-audio", (audioData) => {
      if (!isTranscriptionActive) {
        console.log("Transcription is not active. Ignoring audio data.");
        return;
      }

      console.log("Received audio data from client.");
      transcriber.sendAudioData(audioData); 
    });

    socket.on("stop-stream", () => {
      transcriber.stopTranscriptionStream();
      console.log("Stream stopped by client.");
      isTranscriptionActive = false; 
    });

    socket.on("disconnect", () => {
      transcriber.stopTranscriptionStream();
      console.log(`Client disconnected: ${socket.id}`);
      isTranscriptionActive = false; 
    });

    transcriber.on("partial", (data) => {
      if (socket.connected) {
        socket.emit("partial", data); 
      }
    });

    transcriber.on("final", (data) => {
      if (socket.connected) {
        socket.emit("final", data); 
      }
    });

    transcriber.on("error", (error) => {
      if (socket.connected) {
        socket.emit("error", error); 
      }
    });

    socket.on("disconnect", () => {
      transcriber.removeAllListeners(); 
    });
  });

  return io;
};

export default initializeWebSocket;
