import classes from "./ErrorBadge.module.css";

const ErrorBadge: React.FC<{ message: string }> = (props) => {
	return (
		<div className={classes.layout}>
			<h3>Error</h3>
			<p>{props.message}</p>
		</div>
	);
};

export default ErrorBadge;
