import React from "react";
import ReactDOM from "react-dom";
import NavBar from "../components/NavBar/NavBar";
import classes from "./GamePage.module.css";

const GamePage = () => {
	return (
		<React.Fragment>
			{ReactDOM.createPortal(
				<NavBar />,
				document.getElementById("navbar-root") as Element
			)}
			<div className={classes.test}>Game Page</div>
		</React.Fragment>
	);
};

export default GamePage;
