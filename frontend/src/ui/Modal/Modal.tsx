import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import classes from "./Modal.module.css";

const Backdrop: React.FC<{ onClick: () => any }> = (props) => {
	return <div className={classes.backdrop} onClick={props.onClick} />;
};

const ModalOverlay: React.FC<{
	title: string;
	children: JSX.Element;
	className?: any;
	onClick: () => any;
}> = (props) => {
	const styling = `${classes.modal} ${props.className}`;
	return (
		<div className={styling}>
			<header className={classes.header}>
				<h2>{props.title}</h2>
				<button onClick={props.onClick} className={classes.actions}>
					X
				</button>
			</header>
			{props.children}
		</div>
	);
};

const Modal: React.FC<{
	title: string;
	children: JSX.Element;
	className?: any;
	onClick: () => any;
}> = (props) => {
	return (
		<Fragment>
			{ReactDOM.createPortal(
				<Backdrop onClick={props.onClick} />,
				document.getElementById("backdrop-root") as Element
			)}
			{ReactDOM.createPortal(
				<ModalOverlay
					title={props.title}
					onClick={props.onClick}
					className={props.className}
				>
					{props.children}
				</ModalOverlay>,
				document.getElementById("overlay-root") as Element
			)}
		</Fragment>
	);
};

export default Modal;
