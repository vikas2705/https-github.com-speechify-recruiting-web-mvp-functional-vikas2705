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

const deepgramApiKey = process.env.DEEPGRAM_API_KEY ??'';
const sampleRate = process.env.SAMPLE_RATE ?? 16000
const initializeWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    const transcriber = new Transcriber(deepgramApiKey);

    transcriber.startTranscriptionStream(sampleRate); 

    // Notify the client that the transcriber is ready
    socket.emit("transcriber-ready");

    // Listen for transcription results and send them to the client
    transcriber.on("transcription", (data) => {
      socket.emit("final", data);
    });

    // Send partial transcriptions to the client
    transcriber.on("partial-transcription", (data) => {
      socket.emit("partial", data);
    });

    // Listen for warnings and log them
    transcriber.on("warning", (warning) => {
      console.warn("socket: warning received from Deepgram:", warning);
    });

    // Listen for errors and send them to the client
    transcriber.on("error", (error) => {
      console.error("socket: error received from Deepgram:", error);
      socket.emit("error", error);
    });

    // Handle incoming audio data from the WebSocket client
    socket.on("incoming-audio", (message) => {
      console.log("socket: client data received");

      // Send the audio payload to Deepgram
      transcriber.send(message);
    });

    // Stop the transcription stream when requested
    socket.on("stop-stream", () => {
      transcriber.endTranscriptionStream();
    });

    // Handle WebSocket client disconnection
    socket.on("disconnect", () => {

      // Clean up the transcription stream
      transcriber.endTranscriptionStream();
    });
  });

  return io;
};

export default initializeWebSocket;