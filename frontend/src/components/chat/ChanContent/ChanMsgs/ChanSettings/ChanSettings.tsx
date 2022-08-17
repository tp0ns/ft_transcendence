import Modal from "../../../../../ui/Modal/Modal";

const ChanSettings: React.FC<{ onClick: () => void }> = (props) => {
	return (
		<Modal title="Chat Settings" btnText="X" onClick={props.onClick}>
			<div>Settings</div>
		</Modal>
	);
};

export default ChanSettings;
