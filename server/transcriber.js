import EventEmitter from "events";
import { createClient } from "@deepgram/sdk"; 

class Transcriber extends EventEmitter {
  constructor(io) {
    super();
    if (!io) {
      throw new Error("Socket.IO instance is required for Transcriber");
    }
    this.io = io; 
    this.deepgram = null;
    this.keepAlive = null;
    this.isTranscribing = false;
    this.socket = null;

    this.setupListeners();
  }

  setupListeners() {
    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.socket = socket;

      socket.on("configure-stream", (config) => this.startTranscriptionStream(config));
      socket.on("incoming-audio", (audioData) => this.sendAudioData(audioData));
      socket.on("stop-stream", () => this.stopTranscriptionStream());
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  startTranscriptionStream(config) {
    const { sampleRate } = config;
    if (this.isTranscribing) {
      console.log("Already transcribing. Ignoring new connection.");
      return;
    }

    console.log("Starting new transcription stream...");
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY).listen.live({
      language: "en",
      punctuate: true,
      smart_format: true,
      model: "nova",
      sample_rate: sampleRate,
    });

    this.isTranscribing = true;

    if (this.keepAlive) clearInterval(this.keepAlive);
    this.keepAlive = setInterval(() => {
      console.log("Sending keep-alive ping...");
      this.deepgram.keepAlive();
    }, 10 * 1000);

    this.deepgram.addListener("open", () => {
      console.log("Deepgram connection opened.");
      this.emit("transcriber-ready"); 
    });

    this.deepgram.addListener("transcript", (data) => {
      console.log("Received transcript:", data);
      this.emit("partial", data.channel.alternatives[0].transcript); 
    });

    this.deepgram.addListener("final", (data) => {
      console.log("Final transcript:", data);
      this.emit("final", data.channel.alternatives[0].transcript); 
    });

    this.deepgram.addListener("close", () => {
      console.log("Deepgram connection closed.");
      this.stopTranscriptionStream(); 
    });

    this.deepgram.addListener("error", (error) => {
      console.error("Deepgram error:", error);
      this.emit("error", error); 
    });
  }

  stopTranscriptionStream() {
    if (!this.isTranscribing) {
      console.warn("No active transcription stream to stop.");
      return;
    }

    console.log("Stopping transcription stream...");
    if (this.deepgram) {
      try {
        this.deepgram.finish(); 
      } catch (error) {
        console.error("Error while stopping transcription stream:", error);
      }
    }
    clearInterval(this.keepAlive);
    this.keepAlive = null;
    this.isTranscribing = false;
  }

  sendAudioData(audioData) {
    if (!this.isTranscribing) {
      console.error("Cannot send data. No active transcription stream.");
      return;
    }

    if (this.deepgram && this.deepgram.getReadyState() === 1) {
      this.deepgram.send(audioData); 
    } else {
      console.error("Deepgram connection is not ready.");
    }
  }

  handleDisconnect(socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.stopTranscriptionStream(); 
  }
}

export default Transcriber;
