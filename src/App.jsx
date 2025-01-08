import { useState } from 'react'
import './App.css'
import PlayerScreen from './components/playerScreen/playerscreen'
import TicTacToe from './components/game/tic_tac_tow'


function App() {
  const [game, setGame] = useState(null)

  // if (!game) return <PlayerScreen setGame={setGame} />

  return <TicTacToe />

}

export default App
