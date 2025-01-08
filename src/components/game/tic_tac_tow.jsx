// TicTacToe.jsx
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { getNakama } from '../../config/nakama';

const  data = {
  "presences": {
      "282fd326-cdce-11ef-8dd9-7106fdcb5b46": {
          "Node": "nakama1",
          "UserID": "59f22bba-300a-4617-b860-c858a3b3ccf0",
          "SessionID": "282fd326-cdce-11ef-8dd9-7106fdcb5b46",
          "Username": "12344",
          "Reason": 0
      },
      "2ab5b045-cdce-11ef-8dd9-7106fdcb5b46": {
          "Node": "nakama1",
          "UserID": "cfb191ad-7bd3-4a27-b490-e597a9d2d1ee",
          "SessionID": "2ab5b045-cdce-11ef-8dd9-7106fdcb5b46",
          "Username": "5432",
          "Reason": 0
      }
  },
  "board": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
  ],
  "state": 1,
  "players": {
      "59f22bba-300a-4617-b860-c858a3b3ccf0": "X",
      "cfb191ad-7bd3-4a27-b490-e597a9d2d1ee": "O"
  },
  "next_turn": "59f22bba-300a-4617-b860-c858a3b3ccf0"
}

const TicTacToe = ({game}) => {

  
  const [board, setBoard] = useState(Array(9).fill(''));
  const [nextSymbol, setNextSymbol] = useState('X');
  const [XName, setXName] = useState('');
  const [OName, setOName] = useState('');
  const [nakama, setNakama] = useState(null)

  const updateGameData = (gameData) => {
      for (const presence of Object.values(gameData.presences)) {
        if (gameData.players[presence.UserID] === 'X') {
          setXName(presence.Username)
        } else {
          setOName(presence.Username)
        }
      }

      setBoard(gameData.board)
      setNextSymbol(gameData.players[gameData.next_turn])
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
  
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = async (i) => {

    const move_data = {
      position: i
    }

    nakama.socket.sendMatchState(nakama.matchId, 1, JSON.stringify(move_data))
  };

  // const winner = calculateWinner(board);
  // const status = winner 
  //   ? `Winner: ${winner}`
  //   : `Turn: ${isXNext ? 'X' : 'O'}`;

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setNextSymbol('X');
  };

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-4">
      {/* Game Info */}
      <div className="mb-8 flex justify-center flex-col items-center">
        <div className="flex gap-10 text-white mb-2 text-4xl">
          <div className='text-stone-800 flex flex-col items-center'>
            <div>{XName}</div>
            <div>(X)</div>
          </div>
          {/* <div>Opp (O)</div> */}
          <div className='flex flex-col items-center'>
            <div>{OName}</div>
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
                { 'text-stone-800': square === 'X' },
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
    </div>
  );
};

export default TicTacToe;