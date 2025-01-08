import {Client} from "@heroiclabs/nakama-js"
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

        this.socket.onmatchmakermatched = async (matchmakerMatched) => {
            const match = await this.socket.joinMatch(matchmakerMatched.match_id)
            this.matchId = matchmakerMatched.match_id
            this.gameSetter(match)
        };

        this.socket.onmatchdata = (matchData) => {

            console.log(matchData)
            switch (matchData.op_code) {
                case 2:{
                        const decoder = new TextDecoder('utf-8');
                        const jsonData = decoder.decode(matchData.data);
                        const gameState = JSON.parse(jsonData);
                        this.matchData = gameState
                        console.log("match data", gameState)
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



    async findPlayers() {
        await this.socket.addMatchmaker(null, 2, 2)
    }

    async getTokenWithAuthenticateDevice(machineId) {
        this.session = await this.client.authenticateDevice(machineId, false)
        await this.updateDetails()
        return this.session.token
    }

    async getTokenWithAuthenticateDeviceWithName(machineId, create, name) {
        this.session = await this.client.authenticateDevice(machineId, create, name)
        await this.updateDetails()
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
}

// console.log(nakama)

/**
 * Returns an instance of Nakama, creating one if it doesn't exist.
 * @returns {Nakama} the Nakama instance
 */
export const getNakama = () => {

    if (nakama) return nakama
    nakama = new Nakama("defaultkey", "localhost", 7350, false, 10000, true)
    console.log("nakama created")
    return nakama
}

