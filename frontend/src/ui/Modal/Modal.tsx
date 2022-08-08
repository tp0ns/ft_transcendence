import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import classes from "./Modal.module.css";

const Backdrop: React.FC<{ onClick: () => any }> = (props) => {
	return <div className={classes.backdrop} onClick={props.onClick} />;
};

const ModalOverlay: React.FC<{
	title: string;
	message: string;
	onClick: () => any;
}> = (props) => {
	return (
		<div className={classes.modal}>
			<header className={classes.header}>
				<h2>{props.title}</h2>
			</header>
			<div className={classes.content}>
				<p>{props.message}</p>
			</div>
			<footer className={classes.actions}>
				<button onClick={props.onClick}>Okay</button>
			</footer>
		</div>
	);
};

const ErrorModal: React.FC<{
	title: string;
	message: string;
	onClick: () => any;
}> = (props) => {
	return (
		<Fragment>
			{/* {ReactDOM.createPortal( */}
			<Backdrop onClick={props.onClick} />,
			{/* document.getElementById("backdrop-root") as Element */}
			{/* )} */}
			{/* {ReactDOM.createPortal( */}
			<ModalOverlay
				title={props.title}
				message={props.message}
				onClick={props.onClick}
			/>
			{/* , document.getElementById("overlay-root") as Element */}
			{/* )} */}
		</Fragment>
	);
};

export default ErrorModal;
