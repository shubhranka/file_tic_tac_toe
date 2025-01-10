import {Client, Session} from "@heroiclabs/nakama-js"
import { v4 as uuid } from "uuid";
let nakama = null
class Nakama {
    constructor(key, host, port, ssl, timeout, debug) {
        this.client = new Client(key, host, port, ssl, timeout, debug);
        this.session = null;
        this.token = null;
        this.socket = this.client.createSocket(false,false)
        this.username = null;
        this.id = null;
        this.gameSetter = null;
        this.matchId = null;
        this.updater = null;
        this.matchData = null;
        this.playAgainNotify = null;
        this.gameRestart = null;
        this.handlePlayerDisconnect = null;

        this.socket.onmatchmakermatched = async (matchmakerMatched) => {
            localStorage.setItem("ttt-match-id", matchmakerMatched.match_id)
            const match = await this.socket.joinMatch(matchmakerMatched.match_id)
            this.matchId = matchmakerMatched.match_id
            this.gameSetter(match)
        };

        this.socket.onmatchdata = (matchData) => {

            // console.log(matchData)
            switch (matchData.op_code) {
                case 2:{
                        const decoder = new TextDecoder('utf-8');
                        const jsonData = decoder.decode(matchData.data);
                        const gameState = JSON.parse(jsonData);
                        this.matchData = gameState
                        // console.log("match data", gameState)
                        if (this.updater) {
                            this.updater(gameState)
                        }
                    }
                    break;
                case 3:
                    this.playAgainNotify(true)
                    break;
                case 4:
                    {
                        const decoder = new TextDecoder('utf-8');
                        const jsonData = decoder.decode(matchData.data);
                        const gameState = JSON.parse(jsonData);
                        this.matchData = gameState
                        this.gameRestart(gameState)
                    }
                    break;
                default:
                    break;
            }   
        }
    }



    async findPlayers(mode) {

        const query = `properties.game_mode:${mode}`
        const properties = {
            game_mode: mode
        }
        // check if socket connected
        await this.connectSocket()
        await this.socket.addMatchmaker(query, 2, 2, properties)
    }

    async getTokenWithAuthenticateDevice(token) {
        const session = Session.restore(token)
        if (session.isexpired) {
            const refreshToken = localStorage.getItem("ttt-machine-refersh-token")
            this.session = new Session(token, refreshToken)
        }else{
            this.session = session
        }
        // this.session = await this.client.authenticateDevice(machineId, false)
        await this.updateDetails()
        await this.connectSocket()
        return this.session.token
    }

    async getTokenWithAuthenticateDeviceWithName(name) {
        const id = uuid()
        this.session = await this.client.authenticateDevice(id, true, name)
        localStorage.setItem("ttt-machine-token", this.session.token)
        localStorage.setItem("ttt-machine-refersh-token", this.session.refresh_token)
        await this.updateDetails()
        await this.connectSocket()
        return this.session.token
    }

    async connectSocket() {
        await this.socket.connect(this.session)
    }

    fillDetails(details) {
        this.username = details.user.username
        this.id = details.user.id
    }

    async updateDetails() {
        const details = await this.client.getAccount(this.session)
        this.fillDetails(details)
    }

    async updateUsername(name) {
        this.username = name
        await this.client.updateAccount(this.session, this.username)
    }

    /**
     * Retrieves the leaderboard for the current game.
     * @returns {Promise} resolves to the leaderboard records
     */
    async getCurrentGameLeaderboard() {
        const ownerIds = Object.keys(this.matchData.players)
        return await this.client.listLeaderboardRecords(this.session, "tictactoe_stats", ownerIds, 2)
    }

    async checkForExistingMatch(setGame) {
        const matchId = localStorage.getItem("ttt-match-id")
        if (matchId) {
            try{
                const match = await this.socket.joinMatch(matchId)
                console.log("match found",match)
                this.matchId = matchId
                this.gameSetter = setGame
                setGame(match)
            }catch(e) {
                console.log(e)
            }
        }
    }
}

// console.log(nakama)

/**
 * Returns an instance of Nakama, creating one if it doesn't exist.
 * @returns {Nakama} the Nakama instance
 */
export const getNakama = () => {
    console.log(uuid())
    if (nakama) return nakama
    nakama = new Nakama("defaultkey", import.meta.env.NAKAMA_HOST, import.meta.env.NAKAMA_PORT, false, 10000, true)
    console.log("nakama created")
    return nakama
}

