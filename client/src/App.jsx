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
      <h1 style={{color: "white", textAlign: "center"}}>Speechify Voice Notes</h1>
      {/* <p>Record or type something in the textbox.</p> */}
      <SpeechToText />
    </div>
  );
}

export default App;
