import React from "react";
import { useGameStore } from "./store/gameStore.js";

import IntroScreen from "./components/screens/IntroScreen.jsx";
import TitleScreen from "./components/screens/TitleScreen.jsx";
import CharSelectScreen from "./components/screens/CharSelectScreen.jsx";
import GameWorld from "./components/game/GameWorld.jsx";
import GameOverScreen from "./components/screens/GameOverScreen.jsx";
import WinScreen from "./components/screens/WinScreen.jsx";
import DevLevelSelect from "./components/dev/DevLevelSelect.jsx";

function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <>
      {import.meta.env.DEV && <DevLevelSelect />}
      {screen === "intro" && <IntroScreen />}
      {screen === "title" && <TitleScreen />}
      {screen === "charselect" && <CharSelectScreen />}
      {screen === "game" && <GameWorld />}
      {screen === "gameover" && <GameOverScreen />}
      {screen === "win" && <WinScreen />}
    </>
  );
}

export default App;
