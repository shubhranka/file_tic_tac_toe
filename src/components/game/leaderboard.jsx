import { useEffect, useState } from "react";
import { getNakama } from "../../config/nakama";
import { GiLaurelsTrophy } from "react-icons/gi";
import { FaHourglass } from "react-icons/fa";


const LeaderboardCurrentGame = () => {

    const [leaderboard, setLeaderboard] = useState([])
    const nakama = getNakama()

    const secToMinAnnSec = (sec) => {
        const min = Math.floor(sec / 60)
        const sec2 = sec % 60
        if (min === 0) return `${sec2} sec`
        return `${min} min ${sec2} sec`
    }

    useEffect(() => {

        const func = async () => {
            const leaderboard = await nakama.getCurrentGameLeaderboard()    
            setLeaderboard(leaderboard.owner_records)
            console.log(leaderboard)
        }
        func()
    },[])
    return (
        <div className="w-screen h-screen bg-black bg-opacity-85 absolute top-0 left-0 flex flex-col gap-14 items-center justify-center">
            <div className="flex flex-col gap-4 items-center justify-center">
                <div className="text-9xl font-bold">X</div>
                <div className="flex flex-row justify-center items-end gap-3">
                    <div className="text-5xl font-bold uppercase text-teal-500">Winner!</div>
                    <div className="text-2xl font-bold">+100 points</div>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center justify-center">
                <GiLaurelsTrophy className="text-6xl text-teal-500" />
                <div className="text-2xl font-bold text-teal-500">Leaderboard</div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <div className="grid grid-cols-[auto,1fr,1fr,1fr,1fr] gap-4 w-[400px] md:w-[800px] mb-5">
                    <div className="text-sm md:text-xl font-bold">GRank</div>
                    <div className="text-sm md:text-xl font-bold"></div>
                    <div className="text-sm md:text-xl font-bold">W/L/D</div>
                    <FaHourglass className="text-sm md:text-xl font-bold" />
                    <div className="text-sm md:text-xl font-bold">Score</div>
                {leaderboard.map((record) => (
                    <>
                        <div className="text-sm md:text-xl font-bold">{record.rank}.</div>
                        <div className="text-sm md:text-xl font-bold">{record.username || "Anonymous"} {nakama.id === record.owner_id ? "(You)" : ""} </div>
                        <div className="text-sm md:text-xl font-bold">
                            <span className="text-teal-500">{record.metadata.wins}</span>
                            /
                            <span className="text-red-500">{record.metadata.losses}</span>
                            /
                            <span className="text-yellow-500">{record.metadata.draws}</span>
                        </div>
                        <div className="text-sm md:text-xl font-bold">{secToMinAnnSec(record.metadata.total_time)}</div>
                        <div className="text-sm md:text-xl font-bold">{record.score}</div>
                        </>
                    ))}
                </div>

            </div>
        </div>
    );
}

export default LeaderboardCurrentGame;