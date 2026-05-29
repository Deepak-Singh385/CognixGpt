import { useEffect, useRef, useState } from "react";

const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }

      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (transcript.trim()) {
        onResult(transcript);
        setTranscript("");
      }
    };

    recognitionRef.current = recognition;
  }, [transcript, onResult]);

  const startListening = () => {
    if (isListening) return;
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  return {
    transcript,
    isListening,
    startListening,
  };
};

export default useSpeechRecognition;
