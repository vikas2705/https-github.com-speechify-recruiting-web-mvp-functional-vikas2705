import "./SpeechToText.css";

const SpeechToText = () => {

  const permissionaccess = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      // console.log("Stream received", stream);
      console.log("Media Recorder:", mediaRecorder);
      
    }).catch((error) => {
      console.error("Error accessing media devices.", error);
    });
  };

  return (
    <div className="speech-to-text-main-container">
      <div className="speech-to-text-container">
        <div className="textarea-container">
          <textarea rows={30} />
        </div>
        <div>
          <div className="speect-to-text-btn">
            <button className="text-btn" onClick={permissionaccess}>Start</button>
            <button className="text-btn">Copy</button>
            <button className="text-btn">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
