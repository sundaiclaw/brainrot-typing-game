# Brainrot Typing Game

Brainrot Typing Game is an AI-powered typing-speed game.

## What it does
- asks the player to type absurd meme/brainrot phrases
- generates fresh phrase packs with AI
- punishes wrong characters with a loud synthetic audio blast
- tracks WPM, accuracy, streak, timer, and final score

## User flow
1. Open the homepage.
2. Press start.
3. Type the current phrase as fast as possible.
4. Hear a loud buzz immediately on a wrong key.
5. Finish the timed run and review the score.

## Technical brief
- Frontend: React + Vite single-page app
- Backend: Node/Express endpoint `/api/phrase-pack`
- AI: OpenRouter free chat/completions model returning JSON phrase arrays
- Audio: Web Audio API oscillator + gain shaping for the punishment sound
- Deployment target: Cloud Run container serving the frontend and API together
