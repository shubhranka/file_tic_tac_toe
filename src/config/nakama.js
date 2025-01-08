import {Client} from "@heroiclabs/nakama-js"
let nakama = null
class Nakama {
    constructor(key, host, port, ssl, timeout, debug) {
        this.client = new Client(key, host, port, ssl, timeout, debug);
        this.session = null;
        this.token = null;
        this.socket = this.client.createSocket(false,false)
        this.username = null;
        this.gameSetter = null;

        this.socket.onmatchmakermatched = async (matchmakerMatched) => {
            console.log("matchmakerMatched", matchmakerMatched)
            const match = await this.socket.joinMatch(matchmakerMatched.match_id)
            this.gameSetter(match)
        };
    }

    async findPlayers() {
        const matchTicket = await this.socket.addMatchmaker(null, 2, 2)
        console.log("matchTicket", matchTicket)
    }

    async getTokenWithAuthenticateDevice(machineId) {
        this.session = await this.client.authenticateDevice(machineId, false)
        return this.session.token
    }

    async getTokenWithAuthenticateDeviceWithName(machineId, create, name) {
        this.session = await this.client.authenticateDevice(machineId, create, name)
        return this.session.token
    }

    async connectSocket() {
        await this.socket.connect(this.session)
    }

    async updateDetails() {
        const details = await this.client.getAccount(this.session)
        this.username = details.user.username
    }

    async updateUsername(name) {
        this.username = name
        await this.client.updateAccount(this.session, this.username)
    }
}

// console.log(nakama)

export const getNakama = () => {

    console.log(nakama, "nakama")
    if (nakama) return nakama
    nakama = new Nakama("defaultkey", "localhost", 7350, false, 10000, true)
    console.log("nakama created")
    return nakama
}

