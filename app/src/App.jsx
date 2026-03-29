import { useEffect, useMemo, useRef, useState } from 'react';

const ROUND_SECONDS = 45;

function createBuzz(audioCtxRef) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = audioCtxRef.current || new AudioCtx();
  audioCtxRef.current = ctx;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const distortion = ctx.createWaveShaper();
  distortion.curve = new Float32Array(Array.from({ length: 256 }, (_, i) => {
    const x = (i * 2) / 255 - 1;
    return Math.tanh(20 * x);
  }));
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(distortion).connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

function App() {
  const audioCtxRef = useRef(null);
  const inputRef = useRef(null);
  const [phrases, setPhrases] = useState(['loading brainrot pack…']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loadingPack, setLoadingPack] = useState(false);

  const currentPhrase = phrases[currentIndex] || '';

  useEffect(() => {
    loadPack();
  }, []);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, secondsLeft]);

  const accuracy = totalChars ? Math.max(0, Math.round((correctChars / totalChars) * 100)) : 100;
  const wpm = Math.round(correctChars / 5 / ((ROUND_SECONDS - secondsLeft || 1) / 60 || 1));
  const score = useMemo(() => Math.max(0, wpm * 10 + bestStreak * 3 - mistakes * 2), [wpm, bestStreak, mistakes]);

  async function loadPack() {
    setLoadingPack(true);
    try {
      const response = await fetch('/api/phrase-pack');
      const json = await response.json();
      setPhrases(json.phrases || []);
      setCurrentIndex(0);
      setTyped('');
    } finally {
      setLoadingPack(false);
    }
  }

  function resetRound() {
    setCurrentIndex(0);
    setTyped('');
    setSecondsLeft(ROUND_SECONDS);
    setRunning(true);
    setMistakes(0);
    setCorrectChars(0);
    setTotalChars(0);
    setBestStreak(0);
    setStreak(0);
    inputRef.current?.focus();
  }

  function handleChange(value) {
    if (!running) return;
    const nextExpected = currentPhrase[typed.length];
    const nextChar = value.at(-1);
    if (!nextChar) {
      setTyped(value);
      return;
    }

    setTotalChars((n) => n + 1);
    if (nextChar === nextExpected) {
      const nextTyped = typed + nextChar;
      setTyped(nextTyped);
      setCorrectChars((n) => n + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
      if (nextTyped === currentPhrase) {
        setCurrentIndex((i) => (i + 1) % phrases.length);
        setTyped('');
      }
    } else {
      setMistakes((n) => n + 1);
      setStreak(0);
      createBuzz(audioCtxRef);
    }
  }

  return (
    <div className="shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">AI typing speed punishment chamber</p>
          <h1>Brainrot Typing Game</h1>
          <p className="lede">
            Type cursed brainrot phrases as fast as you can. Miss a letter and the game detonates a loud punishment buzz instantly.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary" onClick={resetRound}>{running ? 'Restart run' : 'Start run'}</button>
          <button className="ghost" onClick={loadPack} disabled={loadingPack}>{loadingPack ? 'Cooking phrases…' : 'New phrase pack'}</button>
        </div>
      </section>

      <section className="grid top-grid">
        <div className="card phrase-card">
          <p className="eyebrow">Current phrase</p>
          <div className="phrase-display">
            <span className="done">{currentPhrase.slice(0, typed.length)}</span>
            <span className="rest">{currentPhrase.slice(typed.length)}</span>
          </div>
          <input
            ref={inputRef}
            className="typing-input"
            value={typed}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={running ? 'type here...' : 'press start'}
            disabled={!running}
          />
        </div>

        <div className="card stats-card">
          <div className="stat"><strong>{secondsLeft}</strong><span>seconds</span></div>
          <div className="stat"><strong>{wpm}</strong><span>WPM</span></div>
          <div className="stat"><strong>{accuracy}%</strong><span>accuracy</span></div>
          <div className="stat"><strong>{bestStreak}</strong><span>best streak</span></div>
          <div className="stat"><strong>{mistakes}</strong><span>mistakes</span></div>
          <div className="stat"><strong>{score}</strong><span>score</span></div>
        </div>
      </section>

      <section className="grid lower-grid">
        <div className="card">
          <h2>Phrase queue</h2>
          <ul>
            {phrases.map((phrase, idx) => (
              <li key={phrase} className={idx === currentIndex ? 'active' : ''}>{phrase}</li>
            ))}
          </ul>
        </div>
        <div className="card final-card">
          <h2>How it works</h2>
          <p>
            The phrase pack is generated by AI, then the client runs a strict next-character check. Wrong key?
            Square-wave buzzer. No mercy.
          </p>
          <p className="callout">Pro tip: headphones will make the punishment dramatically worse.</p>
        </div>
      </section>
    </div>
  );
}

export default App;
