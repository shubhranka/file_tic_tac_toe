import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
// import { RxCross2 } from "react-icons/rx";
import { getNakama } from "../../config/nakama";
import FindingPlayersScreen from "../findingPlayersScreen/findingPlayersScreen";
import { GiTrophy } from "react-icons/gi";
import LeaderboardCurrentGame from "../game/leaderboard";

const PlayerScreen = ({setGame})=> {
    const [sessionToken, setSessionToken] = useState(null)
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true)
    const [findingGame, setFindingGame] = useState(false)
    const [usernameExists, setUsernameExists] = useState(false)
    const [leaderboard, setLeaderboard] = useState()

    useEffect(() => {
        const updateDetails = async () => {

            const token = localStorage.getItem("ttt-machine-token")
            if (!token) {
                setLoading(false)
                return
            }
            const nakama = getNakama()
            const token2 = await nakama.getTokenWithAuthenticateDevice(token)
            if (!token2){
                setLoading(false)
                return
            }
            await nakama.checkForExistingMatch(setGame)
            setName(nakama.username)
            setSessionToken(nakama.session.token)
            setLoading(false)
        }

        updateDetails()
    },[]);

    const handleStartGame = (mode) => {
        setFindingGame(true)
        const nakama = getNakama()
        nakama.gameSetter = setGame
        nakama.findPlayers(mode)
    }


    const handleSubmit = async () => {
        const nakama = getNakama()
        setUsernameExists(false)
        try{
            const token = await nakama.getTokenWithAuthenticateDeviceWithName(name)
            setSessionToken(token)
        }catch(e){
            if(e.status === 409){
                setUsernameExists(true)
            }
        }
    }

    if (loading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center">
                <div className="p-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col justify-center items-center gap-5">
                    <div className="text-2xl font-bold">Loading...</div>
                </div>
            </div>
        )
    }

    if (findingGame) {
        return <FindingPlayersScreen />
    }

    if (leaderboard) {
        return <LeaderboardCurrentGame />
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <div className="p-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col justify-center gap-5">
                { !sessionToken && <>
                <div className="flex flex-row justify-between items-center">
                    <div className="text-2xl font-bold">What is your name?</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <div className="w-full flex flex-col gap-3">
                        <input type="text" placeholder="Enter your name" className="w-full p-2 border border-gray-300 rounded-md"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {usernameExists && <div className="bg-red-500 p-2 rounded-md text-sm">Username Exists</div>}
                    </div>
                </div>
                <div>
                    <button className="bg-teal-500 text-white p-2 rounded-md w-full" onClick={handleSubmit}>Submit</button>
                </div>
                </>}

                { sessionToken && <>
                <div className="text-2xl font-bold">Welcome 👋 {name}</div>
                <div className="flex flex-col gap-3">

                    <div className="flex flex-row justify-between items-center gap-4">
                        {/* <button className=" text-white p-2 rounded-md w-full hover:border-teal-700" onClick={() => setSessionToken(null)}>Change Name</button> */}
                        <button className="bg-teal-500 text-white p-2 rounded-md w-full" onClick={() => handleStartGame("quick")}>Quick Play</button>
                        <button className="bg-teal-500 text-white p-2 rounded-md w-full" onClick={() => handleStartGame("normal")}>Normal Play</button>
                    </div>
                    <div className="cursor-pointer bg-stone-800 border-teal-700 border-2 text-white p-1 rounded-md w-full flex flex-row items-center justify-center hover:bg-stone-900"
                    onClick={() => setLeaderboard(true)}>
                        <GiTrophy className="text-3xl text-yellow-500" />
                        <button className="bg-transparent text-lg">Leaderboard</button>
                    </div>
                </div>
                </>}
            </div>
        </div>
    )   
}
PlayerScreen.propTypes = {
    setGame: PropTypes.func.isRequired,
};

export default PlayerScreen;