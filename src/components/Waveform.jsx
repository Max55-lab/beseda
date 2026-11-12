const PATTERN = [
  0.3, 0.55, 0.9, 0.45, 1, 0.7, 1.35, 0.8, 1.2, 1.7, 0.9, 1.45, 1.9, 1.1, 1.55, 0.75,
  1.75, 0.95, 1.3, 0.6, 1.05, 0.4, 0.7, 0.35,
];

export default function Waveform({ animate = true, className = "", bars = PATTERN.length }) {
  const items = PATTERN.slice(0, bars);
  const max = Math.max(...items);
  return (
    <span className={`waveform ${className}`} aria-hidden="true">
      {items.map((value, index) => (
        <i
          key={index}
          style={{
            height: `${Math.round((value / max) * 100)}%`,
            animationDelay: `${index * 0.06}s`,
            animationPlayState: animate ? "running" : "paused",
          }}
        />
      ))}
    </span>
  );
}
