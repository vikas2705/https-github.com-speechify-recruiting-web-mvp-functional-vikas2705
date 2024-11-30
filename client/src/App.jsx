import { useEffect } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";
import Navbar from "./components/Navbar/Navbar";
import SpeechToText from "./components/SpeechToText/SpeechToText";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.
// NOTE: Don't use createPortal()

function App() {
  const { initialize } = useSocket();

  useEffect(() => {
    // Note: must connect to server on page load but don't start transcriber
    initialize();
  }, []);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (data) => {},
  });

  const onStartRecordingPress = async () => {
    // start recorder and transcriber (send configure-stream)
  };

  const onStopRecordingPress = async () => {};

  // ... add more functions
  return (
    <div>
      <Navbar />
      <h1 style={{color: "white", textAlign: "center"}}>Speechify Voice Notes</h1>
      {/* <p>Record or type something in the textbox.</p> */}
      <SpeechToText />
    </div>
  );
}

export default App;
