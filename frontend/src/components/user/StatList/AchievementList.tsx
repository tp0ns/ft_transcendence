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
		socket.on("sendStatistics", (stats) => setStatistics(stats));
		socket.on("sendAchievements", (achieve) => {
			setAchievements(achieve);
		});
	}, []);

	return (
		<div className={classes.success_layout}>
			<div className={classes.stats}></div>
			<div className={classes.achieve}></div>
		</div>
	);
};

export default AchievementList;
