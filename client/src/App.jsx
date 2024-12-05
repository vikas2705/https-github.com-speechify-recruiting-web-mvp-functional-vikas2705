import { useEffect } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";
import Navbar from "./components/Navbar/Navbar";
import './App.css'
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
      <div className="speech-to-text-main-container">
        <div className="speech-to-text-container">
          <div className="textarea-container">
            <textarea rows={30} value={transcriptions} readOnly />
          </div>
          <div>
            <div className="speech-to-text-btn">
              {isTranscriberReady ? (
                <>
                  <button className="text-btn" onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                  <button className="text-btn">Copy</button>
                  <button className="text-btn">Clear</button>
                </>
              ) : (
                <p>Waiting for the transcriber to be ready...</p>
              )}
              {error && <p style={{ color: "red" }}>Error: {error}</p>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
