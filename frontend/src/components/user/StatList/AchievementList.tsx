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
		socket.on("endGame", () => {
			socket.emit("getStatistics", props.userId);
			socket.emit("getAchievements", props.userId);
		});
	}, [props.userId]);

	useEffect(() => {
		socket.on("sendStatistics", (stats) => {
			setStatistics(stats);
		});
		socket.on("sendAchievements", (achieve) => {
			setAchievements(achieve);
		});
	}, []);

	return (
		<div className={classes.success_layout}>
			<h1 className={classes.success_title}>Statistics</h1>
			<div className={classes.stats}>
				<div>
					<h2 className={classes.stat_number}>{statistics?.victory}</h2>
					<p className={classes.stat_desc}>Victory</p>
				</div>
				<div>
					<h2 className={classes.stat_number}>{statistics?.defeat}</h2>
					<p className={classes.stat_desc}>Defeat</p>
				</div>
				<div>
					<h2 className={classes.stat_number}>{statistics?.ratio + "%"}</h2>
					<p className={classes.stat_desc}>Winrate</p>
				</div>
			</div>
			<h1 className={classes.success_title}>Achievements</h1>
			<div className={classes.achievements}>
				{achievements?.Victoryx3 ? (
					<div>
						<img
							src="/victoryx3.svg"
							alt="3 time victorious"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>3 Wins</p>
					</div>
				) : null}
				{achievements?.Victoryx5 ? (
					<div>
						<img
							src="/victoryx5.svg"
							alt="5 time victorious"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>5 Wins</p>
					</div>
				) : null}
				{achievements?.Victoryx10 ? (
					<div>
						<img
							src="/victoryx10.svg"
							alt="10 time victorious"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>10 Wins</p>
					</div>
				) : null}
				{achievements?.FirstMatch ? (
					<div>
						<img
							src="/firstMatch.svg"
							alt="Completed his first match"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>First Match</p>
					</div>
				) : null}
				{achievements?.Defeatx3 ? (
					<div>
						<img
							src="/defeatx3.svg"
							alt="Lost 3 times"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>3 Looses</p>
					</div>
				) : null}
				{achievements?.Builder ? (
					<div>
						<img
							src="/builder.svg"
							alt="Helped to build this website"
							className={classes.achieve_badge}
						/>
						<p className={classes.achieve_desc}>Builder</p>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default AchievementList;
