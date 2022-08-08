import React from "react";
import UserProp from "../../interfaces/User.interface";
import classes from "./SettingsUser.module.css";

const SettingsUser: React.FC<{ user: UserProp | undefined }> = (props) => {
	return (
		<div className={classes.list}>
			<label className={classes.switch}>
				<input type="checkbox" />
				<span className={`${classes.slider} ${classes.round}`}></span>
			</label>
		</div>
	);
};

export default SettingsUser;
