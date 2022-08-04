import ReactDOM from "react-dom";
import React from "react";
import NavBar from "../components/NavBar/NavBar";

const SocialPage = () => {
	return (
		<React.Fragment>
			{ReactDOM.createPortal(
				<NavBar />,
				document.getElementById("navbar-root") as Element
			)}
			<div>Social Page</div>
		</React.Fragment>
	);
};

export default SocialPage;
