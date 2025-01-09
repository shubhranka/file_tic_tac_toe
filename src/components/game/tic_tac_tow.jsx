// TicTacToe.jsx
import { useEffect, useState } from "react";
import cn from "classnames";
import { getNakama } from "../../config/nakama";
import Leaderboard from "./leaderboard";

const data = {
  presences: {
    "bf3922a5-ce88-11ef-b88f-7106fdcb5b46": {
      Node: "nakama1",
      UserID: "ea5472c2-6559-480a-ae74-a35ab495e168",
      SessionID: "bf3922a5-ce88-11ef-b88f-7106fdcb5b46",
      Username: "uUSVwbIpRN",
      Reason: 0,
    },
    "c077fcaa-ce88-11ef-b88f-7106fdcb5b46": {
      Node: "nakama1",
      UserID: "1ef3a0f9-9def-440d-8587-691ed99bd748",
      SessionID: "c077fcaa-ce88-11ef-b88f-7106fdcb5b46",
      Username: "tvXmZGwJsQ",
      Reason: 0,
    },
  },
  board: ["", "", "", "", "", "", "", "", ""],
  state: 1,
  players: {
    "1ef3a0f9-9def-440d-8587-691ed99bd748": "X",
    "ea5472c2-6559-480a-ae74-a35ab495e168": "O",
  },
  next_turn: "1ef3a0f9-9def-440d-8587-691ed99bd748",
  winner: "",
  start_time: 1736427230,
  end_time: 0,
  play_again_requests: {},
  disconnected_players: {},
  reconnect_window: 30000000000,
  player_timers: {
    "1ef3a0f9-9def-440d-8587-691ed99bd748": {
      time_remaining: 94402,
      last_tick_time: 1736427235679,
      is_paused: false,
    },
    "ea5472c2-6559-480a-ae74-a35ab495e168": {
      time_remaining: 100000,
      last_tick_time: 1736427230081,
      is_paused: true,
    },
  },
  game_mode: "normal",
  timer_duration: 100000,
};

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [nextSymbol, setNextSymbol] = useState("X");
  const [XName, setXName] = useState("");
  const [Xid, setXid] = useState("");
  const [Oid, setOid] = useState("");
  const [OName, setOName] = useState("");
  const [XTimer, setXTimer] = useState(0);
  const [OTimer, setOTimer] = useState(0);
  const [winner, setWinner] = useState(null);
  const [draw,setDraw] = useState(null)

  const nakama = getNakama();

  const resetGame = (gameData) => {
    setWinner(null);
    updateGameData(gameData);
  };

  const updateGameData = (gameData) => {
    let xid,oid;
    if (!gameData) return;
    for (const presence of Object.values(gameData.presences)) {
      if (gameData.players[presence.UserID] === "X") {
        xid = presence.UserID
        setXid(presence.UserID);
        setXName(presence.Username)
      } else {
        oid = presence.UserID
        setOName(presence.Username)
        setOid(presence.UserID)
      }
    }

    // setBoard(gameData.board)
    setBoard((prevBoard) => {
      let differentBoard = false;
      for (let i = 0; i < 9; i++) {
        if (prevBoard[i] !== gameData.board[i]) {
          differentBoard = true;
          break;
        }
      }
      if (differentBoard)
        return gameData.board;
      else 
        return prevBoard;
    });

    setNextSymbol(gameData.players[gameData.next_turn])
    setXTimer(Math.floor(Number(gameData.player_timers[xid].time_remaining)/1000))
    setOTimer(Math.floor(Number(gameData.player_timers[oid].time_remaining)/1000))

    if (gameData.state === 2) {
      console.log(gameData)
      const winner = gameData.players[gameData.winner];
      if (!winner){
        setDraw(true)
      }else{
        setWinner(winner);
      }
    }
  };

  useEffect(() => {
    const updateDetails = async () => {
      nakama.updater = updateGameData;
      nakama.gameRestart = resetGame;
      await nakama.connectSocket();
      updateGameData(nakama.matchData);
    };

    updateDetails();
  }, []);

  if (!nakama) {
    return <div>Loading...</div>;
  }

  const handleClick = async (i) => {
    const move_data = {
      position: i,
    };

    nakama.socket.sendMatchState(nakama.matchId, 1, JSON.stringify(move_data));
  };

  const status = winner ? `Winner: ${winner}` : `${nextSymbol} : turn`;

  console.log("board update");

  return (
    <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-4 relative">
      {/* Game Info */}
      <div className="mb-8 flex justify-center flex-col items-center">
        <div className="flex gap-10 text-white mb-2 text-4xl">
          <div className="grid grid-cols-[50px,1fr] gap-7">
            <div className="text-stone-800 font-thin text-6xl">
              {nextSymbol == "X" ? XTimer : ""}
            </div>
            <div className="text-stone-800 flex flex-col items-center">
              <div>{nakama.id === Xid ? "You" : XName}</div>
              {/* <div>Anonymous</div> */}
              <div>(X)</div>
            </div>
          </div>
          {/* <div>Opp (O)</div> */}
          <div className="grid grid-cols-[1fr,50px] gap-7">
            <div className="flex flex-col items-center">
              <div>{nakama.id === Oid ? "You" : OName}</div>
              {/* <div>Anonymous</div> */}
              <div>(O)</div>
            </div>
            <div className="font-thin text-6xl">
              {nextSymbol !== "X" ? OTimer : ""}
            </div>
          </div>
        </div>
        <div
          className={cn("text-5xl font-thin mt-4", {
            "text-stone-800": nextSymbol === "X",
          })}
        >
          {status}
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 w-[200px] md:w-[300px]">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={cn(
              "aspect-square border-2 rounded-sm bg-teal-500 text-2xl md:text-4xl font-bold flex items-center justify-center transition-colors hover:bg-white/10 focus:outline-none outline-none",
              { "border-r-stone-900": (i + 1) % 3 !== 0 },
              { "border-b-stone-900": i < 6 },
              { "text-stone-800": square.toLowerCase() === "x" }
            )}
          >
            {square}
          </button>
        ))}
      </div>

      {winner && <Leaderboard draw={draw} winner={winner} />}
    </div>
  );
};

export default TicTacToe;
