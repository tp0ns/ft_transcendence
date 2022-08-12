import React, { useState } from "react";
import NavBar from "../components/NavBar/NavBar";
import { socket } from "../App";
import InputAndButton from "../ui/InputAndButton";


const SocialPage = () => {

	const handleNewDM = (inputUser: string) => {
		socket.emit("createDM", inputUser);
	  };


	return (
		<React.Fragment>
				<NavBar />
			<div>Social Page</div>
			<InputAndButton
            buttonName="createDM"
            capturedInfo={handleNewDM}
          />
		</React.Fragment>
	);
};

export default SocialPage;

