import MatchHistoryInterface from "../../../../interfaces/MatchHistory.interface";
import classes from "./MatchItem.module.css";

const MatchItem: React.FC<{ match: MatchHistoryInterface }> = (props) => {
	return (
		<div className={classes.item_layout}>
			<div className={classes.winner}>
				<h1>{props.match.winnerScore}</h1>
				<p className={classes.username}>{props.match.winnerUsername}</p>
			</div>
			<div className={classes.looser}>
				<h1>{props.match.loserScore}</h1>
				<p className={classes.username}>{props.match.loserUsername}</p>
			</div>
		</div>
	);
};

export default MatchItem;
