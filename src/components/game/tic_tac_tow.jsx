// TicTacToe.jsx
import { useState } from 'react';
import cn from 'classnames';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [nextSymbol, setNextSymbol] = useState('X');

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

  const handleClick = (i) => {
    if (board[i] || calculateWinner(board)) return;
    
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setNextSymbol(isXNext ? 'O' : 'X');
  };

  const winner = calculateWinner(board);
  const status = winner 
    ? `Winner: ${winner}`
    : `Turn: ${isXNext ? 'X' : 'O'}`;

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setNextSymbol('X');
  };

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-4">
      {/* Game Info */}
      <div className="mb-8 flex justify-center flex-col items-center">
        <div className="flex gap-10 text-white mb-2 text-4xl">
          <div className='text-stone-800'>
            <div>You</div>
            <div>(X)</div>
          </div>
          {/* <div>Opp (O)</div> */}
          <div>
            <div>Opp</div>
            <div>(O)</div>
          </div>
        </div>
        <div className={cn("text-5xl font-thin mt-4",
            { 'text-stone-800': nextSymbol === 'X' }
        )}>{status}</div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 w-[400px]">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={cn("aspect-square border-2 rounded-sm bg-teal-500 text-white text-5xl font-bold flex items-center justify-center transition-colors hover:bg-white/10 focus:outline-none outline-none",
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