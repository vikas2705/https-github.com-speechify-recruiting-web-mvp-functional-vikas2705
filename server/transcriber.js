import EventEmitter from "events";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

class Transcriber extends EventEmitter {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.deepgramClient = createClient(this.apiKey);
    this.deepgram = null;
    this.keepAliveInterval = null;
  }


  initEventListeners() {
      // Event listeners for Deepgram events
    this.deepgram.addListener(LiveTranscriptionEvents.Open, this.onOpen.bind(this));
    this.deepgram.addListener(LiveTranscriptionEvents.Transcript, this.onTranscript.bind(this));
    this.deepgram.addListener(LiveTranscriptionEvents.Close, this.onClose.bind(this));
    this.deepgram.addListener(LiveTranscriptionEvents.Error, this.onError.bind(this));
    this.deepgram.addListener(LiveTranscriptionEvents.Warning, this.onWarning.bind(this));
    this.deepgram.addListener(LiveTranscriptionEvents.Metadata, this.onMetadata.bind(this));
  }

  // Start the transcription stream
  startTranscriptionStream(sampleRate) {
    this.deepgram = this.deepgramClient.listen.live({
      language: "en",
      punctuate: true,
      smart_format: true,
      model: "nova",
      interim_results: true,
      encoding: "linear16",
      sample_rate: sampleRate,
    });

    // Set up keep-alive mechanism
    this.startKeepAlive();

    this.initEventListeners();

  }

  // Stop the transcription stream
  endTranscriptionStream() {
    if (this.deepgram) {
      this.deepgram.finish();
      this.deepgram.removeAllListeners();
      this.stopKeepAlive();
      this.deepgram = null;
    }
  }

  // Send audio payload to Deepgram
  send(payload) {
    if (this.deepgram && this.deepgram.getReadyState() === 1) { // 1 = OPEN
      this.deepgram.send(payload);
    } else {
      console.error("Deepgram connection is not ready. Cannot send payload.");
    }
  }

  // Handle open connection
  onOpen() {
    this.emit("connected");
  }

  // Handle transcription results
  onTranscript(data) {
    this.emit("transcription", data);
  }

  // Handle metadata events
  onMetadata(data) {
    this.emit("metadata", data);
  }

  // Handle connection close
  onClose() {
    this.emit("disconnected");
    this.endTranscriptionStream(); 
  }

  // Handle errors
  onError(error) {
    this.emit("error", error);
  }

  // Handle warnings
  onWarning(warning) {
    this.emit("warning", warning);
  }

  // Start the keep-alive mechanism
  startKeepAlive() {
    this.stopKeepAlive(); // Ensure no duplicate intervals
    this.keepAliveInterval = setInterval(() => {
      this.deepgram.keepAlive();
    }, 10 * 1000); // 10 seconds
  }

  // Stop the keep-alive mechanism
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

export default Transcriber;
