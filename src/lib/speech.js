let voicesReady = false;

function pickVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("hr")) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("sr")) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("bs")) ||
    null
  );
}

export function canSpeak() {
  return "speechSynthesis" in window;
}

/**
 * Izgovara riječ preko Web Speech API-ja.
 * Vraća "hr" ako je pronađen hrvatski glas, "fallback" ako koristimo drugi, null ako ne ide.
 */
export function speak(text, { rate = 0.82 } = {}) {
  if (!canSpeak()) return null;
  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang;
  } else {
    utter.lang = "hr-HR";
  }
  utter.rate = rate;
  utter.pitch = 1;

  if (!voicesReady) {
    // Chrome zna dati glasove tek nakon prvog poziva
    window.speechSynthesis.getVoices();
    voicesReady = true;
  }

  synth.speak(utter);
  return voice && voice.lang.toLowerCase().startsWith("hr") ? "hr" : "fallback";
}
