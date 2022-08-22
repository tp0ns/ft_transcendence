import Modal from "../../../../../ui/Modal/Modal";
import classes from "./ChanSettings.module.css";

const ChanSettings: React.FC<{ onClick: () => void }> = (props) => {
	return (
		<Modal
			title="Channel settings"
			onClick={props.onClick}
			className={classes.modal_layout}
		>
			<div className={classes.settings}>
				
			</div>
		</Modal>
	);
};

export default ChanSettings;
