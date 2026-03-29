# Design: Brainrot Typing Game

## System
- React frontend for the game loop and UI.
- Node/Express backend endpoint for AI phrase-pack generation.
- Web Audio API for synthesizing a loud punishment sound.
- OpenRouter free model with strict JSON output for phrase packs.

## Flow
1. User opens the app and starts a run.
2. Client fetches or refreshes an AI-generated phrase pack.
3. User types character-by-character against a timer.
4. Incorrect next character triggers immediate buzzer feedback and mistake tracking.
5. Run ends with final score, WPM, accuracy, and streak summary.
