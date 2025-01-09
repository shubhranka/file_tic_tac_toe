import { TbFidgetSpinner } from "react-icons/tb";

const FindingPlayersScreen = () => {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            <div className="p-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col justify-center items-center gap-5">
                <div className="text-2xl font-bold">Finding a random player...</div>
                <TbFidgetSpinner className="text-2xl animate-spin" />
                <div className="text-sm">It usually takes time</div>
            </div>
        </div>
    )
}

export default FindingPlayersScreen