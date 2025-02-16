// TicTacToe.jsx
import { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { getNakama } from "../../config/nakama";
import Leaderboard from "./leaderboard";

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
  const [disconnectedPlayers, setDisconnectedPlayers] = useState([]);

  const nakama = getNakama();

  const resetGame = useCallback((gameData) => {
    setWinner(null);
    updateGameData(gameData);
  }, []);

  const getSeconds = (time) => {
    const seconds = Date.now() - new Date(time);
    return 30 - Math.floor(seconds / 1000);
  };

  const updateGameData = (gameData) => {
    let xid,oid;
    if (!gameData) return;
    console.log(gameData)
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
    if(xid)
    setXTimer(Math.floor(Number(gameData.player_timers[xid].time_remaining)/1000))
    if(oid)
    setOTimer(Math.floor(Number(gameData.player_timers[oid].time_remaining)/1000))

    // setDisconnectedPlayers(players => {
    //   let changed = false
    //   for (const player of Object.keys(gameData.disconnected_players)) {
    //     if (!Object.keys(players).includes(player)) {
    //         changed = true
    //         break
    //     }
    //   }
    //   if (changed) 
    //     return gameData.disconnected_players;
    //   else
    //     return players
    // });

    setDisconnectedPlayers(gameData.disconnected_players);

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
  }, [nakama, resetGame]);

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
          <div className={cn("grid grid-cols-[50px,1fr] gap-7",{
                "text-red-500": Object.keys(disconnectedPlayers).includes(Xid),
                "text-stone-800": !Object.keys(disconnectedPlayers).includes(Xid)
              })}>
            <div className="text-6xl font-thin">
              { Object.keys(disconnectedPlayers).includes(Xid) ? getSeconds(disconnectedPlayers[Xid]) : nextSymbol == "X" ? XTimer : ""}
            </div>
            <div className="flex flex-col items-center">
              <div>{nakama.id === Xid ? "You" : XName}</div>
              {/* <div>Anonymous</div> */}
              <div>(X)</div>
            </div>
          </div>
          {/* <div>Opp (O)</div> */}
          <div className={cn("grid grid-cols-[1fr,50px] gap-7",{
                "text-red-500": Object.keys(disconnectedPlayers).includes(Oid),
              })}>
            <div className="flex flex-col items-center ">
              <div> {nakama.id === Oid ? "You" : OName}</div>
              {/* <div className={cn({
                "text-red-500": disconnectedPlayers.includes(Oid)
              })}>Anonymous</div> */}
              <div>(O)</div>
            </div>
            <div className={cn("font-thin text-6xl",{
              "text-red-500": Object.keys(disconnectedPlayers).includes(Oid)
            })}>
              { Object.keys(disconnectedPlayers).includes(Oid) ? getSeconds(disconnectedPlayers[Oid]) : nextSymbol == "O" ? OTimer : ""}
              {/* {nextSymbol !== "X" ? OTimer : ""} */}
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

      {(winner || draw) && <Leaderboard draw={draw} winner={winner} />}
    </div>
  );
};

export default TicTacToe;
