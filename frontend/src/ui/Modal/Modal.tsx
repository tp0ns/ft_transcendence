import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { JsxElement } from "typescript";
import classes from "./Modal.module.css";

const Backdrop: React.FC<{ onClick: () => any }> = (props) => {
	return <div className={classes.backdrop} onClick={props.onClick} />;
};

const ModalOverlay: React.FC<{
	title: string;
	children: JSX.Element;
	onClick: () => any;
}> = (props) => {
	return (
		<div className={classes.modal}>
			<header className={classes.header}>
				<h2>{props.title}</h2>
			</header>
			{props.children}
			<footer className={classes.actions}>
				<button onClick={props.onClick}>Close</button>
			</footer>
		</div>
	);
};

const Modal: React.FC<{
	title: string;
	children: JSX.Element;
	onClick: () => any;
}> = (props) => {
	return (
		<Fragment>
			{ReactDOM.createPortal(
				<Backdrop onClick={props.onClick} />,
				document.getElementById("backdrop-root") as Element
			)}
			{ReactDOM.createPortal(
				<ModalOverlay title={props.title} onClick={props.onClick}>
					{props.children}
				</ModalOverlay>,
				document.getElementById("overlay-root") as Element
			)}
		</Fragment>
	);
};

export default Modal;
