import React from 'react';
import { useGameStore } from './store/gameStore.js';

import TitleScreen      from './components/screens/TitleScreen.jsx';
import CharSelectScreen from './components/screens/CharSelectScreen.jsx';
import GameWorld        from './components/game/GameWorld.jsx';
import GameOverScreen   from './components/screens/GameOverScreen.jsx';
import WinScreen        from './components/screens/WinScreen.jsx';

function App() {
  const screen = useGameStore(s => s.screen);

  return (
    <>
      {screen === 'title'      && <TitleScreen />}
      {screen === 'charselect' && <CharSelectScreen />}
      {screen === 'game'       && <GameWorld />}
      {screen === 'gameover'   && <GameOverScreen />}
      {screen === 'win'        && <WinScreen />}
    </>
  );
}

export default App;
