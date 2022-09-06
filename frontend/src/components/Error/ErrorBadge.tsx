import classes from "./ErrorBadge.module.css";

const ErrorBadge: React.FC<{ message: string }> = (props) => {
	return (
		<div className={classes.layout}>
			<div className={classes.error}>ERROR</div>
			<div className={classes.message}>{props.message}</div>
		</div>
	);
};

export default ErrorBadge;
