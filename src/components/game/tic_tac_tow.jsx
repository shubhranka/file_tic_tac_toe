// TicTacToe.jsx
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { getNakama } from '../../config/nakama';
import Leaderboard from './leaderboard';

const TicTacToe = () => {

  
  const [board, setBoard] = useState(Array(9).fill(''));
  const [nextSymbol, setNextSymbol] = useState('X');
  const [XName, setXName] = useState('');
  const [Xid, setXid] = useState('');
  const [Oid, setOid] = useState('');
  const [OName, setOName] = useState('');
  const [nakama, setNakama] = useState(null)
  const [winner, setWinner] = useState(null)

  const updateGameData = (gameData) => {
      for (const presence of Object.values(gameData.presences)) {
        if (gameData.players[presence.UserID] === 'X') {
          setXid(presence.UserID)
          setXName(presence.Username)
        } else {
          setOName(presence.Username)
          setOid(presence.UserID)
        }
      }

      setBoard(gameData.board)
      setNextSymbol(gameData.players[gameData.next_turn])

      if (gameData.state === 2) {
        const winner = gameData.players[gameData.winner]
        setWinner(winner)
      }
  }
  
  useEffect(() => {
    setNakama(nakama)
    const updateDetails = async () => {
      const nakama = getNakama()
      nakama.updater = updateGameData
      console.log(nakama)
      await nakama.connectSocket()
      setNakama(nakama)
      updateGameData(nakama.matchData)
    }

    updateDetails()

  }, []);

  if (!nakama) {
    return <div>Loading...</div>
  }

  const handleClick = async (i) => {

    const move_data = {
      position: i
    }

    nakama.socket.sendMatchState(nakama.matchId, 1, JSON.stringify(move_data))
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setNextSymbol('X');
  };

  const status = winner ? `Winner: ${winner}` : `${nextSymbol} : turn`;

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-4 relative">
      {/* Game Info */}
      <div className="mb-8 flex justify-center flex-col items-center">
        <div className="flex gap-10 text-white mb-2 text-4xl">
          <div className='text-stone-800 flex flex-col items-center'>
            <div>{nakama.id === Xid ? "You" : XName}</div>
            <div>(X)</div>
          </div>
          {/* <div>Opp (O)</div> */}
          <div className='flex flex-col items-center'>
            <div>{nakama.id === Oid ? "You" : OName}</div>
            <div>(O)</div>
          </div>
        </div>
        <div className={cn("text-5xl font-thin mt-4",
            { 'text-stone-800': nextSymbol === 'X' }
        )}>{status}</div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 w-[200px] md:w-[300px]">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={cn("aspect-square border-2 rounded-sm bg-teal-500 text-white text-2xl md:text-4xl font-bold flex items-center justify-center transition-colors hover:bg-white/10 focus:outline-none outline-none",
                { 'border-r-stone-900': (i+1) % 3 !== 0 },
                { 'border-b-stone-900' : i < 6 },
                { 'text-stone-800': square.toLowerCase() === 'x' },
            )}
          >
            {square}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={resetGame}
        className="mt-8 px-6 py-2 bg-white/20 text-white rounded-lg
                   hover:bg-white/30 transition-colors focus:outline-none"
      >
        Reset Game
      </button>

      {winner && <Leaderboard />}
    </div>
  );
};

export default TicTacToe;