import { useEffect } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";
import Navbar from "./components/Navbar/Navbar";
import SpeechToText from "./components/SpeechToText/SpeechToText";

function App() {
  const { initialize, disconnect, sendAudio, transcriptions, isTranscriberReady, error } = useSocket();
  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (audioData) => {
      sendAudio(audioData);
    },
  });

  useEffect(() => {
    initialize(); 
    return () => {
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div>
      <Navbar />
      <h1 style={{ color: "white", textAlign: "center" }}>
        Speechify Voice Notes
      </h1>
      {/* <p>Record or type something in the textbox.</p> */}
      <SpeechToText />
      <h1>Real-Time Transcription</h1>
      {isTranscriberReady ? (
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      ) : (
        <p>Waiting for the transcriber to be ready...</p>
      )}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div>
        <h2>Transcriptions:</h2>
        {transcriptions.map((text, index) => (
          <p key={index}>{text.channel.alternatives[0].transcript}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
