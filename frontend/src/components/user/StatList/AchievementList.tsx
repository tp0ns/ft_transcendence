import { useEffect, useState } from "react";
import { socket } from "../../../App";
import AchievementsInterface from "../../../interfaces/Achievement.interface";
import StatisticsInterface from "../../../interfaces/Statistics.interface";
import classes from "./AchievementList.module.css";

const AchievementList: React.FC<{ userId: string }> = (props) => {
	const [statistics, setStatistics] = useState<StatisticsInterface>();
	const [achievements, setAchievements] = useState<AchievementsInterface>();

	useEffect(() => {
		socket.emit("getStatistics", props.userId);
		socket.emit("getAchievements", props.userId);
		// socket.on("endGame", () => {
		// 	socket.emit("getStatistics", props.userId);
		// 	socket.emit("getAchievements", props.userId);
		// });
		socket.on("sendStatistics", (stats) => {
			console.log(stats);
			setStatistics(stats);
		});
		socket.on("sendAchievements", (achieve) => {
			setAchievements(achieve);
		});
	}, []);

	return (
		<div className={classes.success_layout}>
			<h1 className={classes.stats_title}>Statistics</h1>
			<div className={classes.stats}>
				<div className={classes.stat}>
					<h2>{statistics?.victory}</h2>
					<p>Victory</p>
				</div>
				<div className={classes.stat}>
					<h2>{statistics?.defeat}</h2>
					<p>Defeat</p>
				</div>
				<div className={classes.stat}>
					<h2>{statistics?.ratio}</h2>
					<p>Winrate</p>
				</div>
			</div>
			<div className={classes.achieve}>
				<h1>Achievements</h1>
			</div>
		</div>
	);
};

export default AchievementList;
