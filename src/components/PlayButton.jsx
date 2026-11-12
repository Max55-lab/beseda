import { useEffect, useRef, useState } from "react";
import { canSpeak, speak } from "../lib/speech.js";

export default function PlayButton({ text, label = "Poslušaj izgovor", size = "normal" }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = () => {
    if (!canSpeak()) {
      setState("nema");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 2600);
      return;
    }
    speak(text);
    setState("svira");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button
      type="button"
      className={`play ${size === "veliki" ? "play-veliki" : ""} ${state === "svira" ? "je-aktivna" : ""}`}
      onClick={handleClick}
      aria-label={label}
      title={state === "nema" ? "Ovaj preglednik ne podržava izgovor." : label}
    >
      <span className="play-ikona" aria-hidden="true" />
      <span className="play-tekst">
        {state === "nema" ? "Preglednik ne podržava zvuk" : label}
      </span>
    </button>
  );
}
