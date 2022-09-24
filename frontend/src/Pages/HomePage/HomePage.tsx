import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import Layout from "../../components/Layout/Layout";
import classes from "HomePage.module.css";

const HomePage: React.FC<{}> = () => {
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("waitingMatchmaking", () => {
			navigate("/waiting");
		});
		socket.on("matchAccepted", (roomId) => {
			socket.emit("joinGame", roomId);
			navigate("/game");
		});
	}, []);

	function startMatchmaking() {
		socket.emit("matchmaking");
	}

	return (
		<Layout>
			<div>
				<p>HomePage</p>
				<div
					onClick={() => {
						startMatchmaking();
					}}
				>
					START MATCHMAKING
				</div>
			</div>
		</Layout>
	);
};

export default HomePage;
