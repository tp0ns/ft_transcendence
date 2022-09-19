import classes from "./NormalMemberItem.module.css";
import UserProp from "../../../../../interfaces/User.interface";
import Modal from "../../../../../ui/Modal/Modal";
import UserContent from "../../../../user/UserContent/UserContent";
import { useContext, useState } from "react";
import ChatContext from "../../../../../context/chat-context";
import { socket } from "../../../../../App";
import { useNavigate } from "react-router-dom";

const NormalMemberItem: React.FC<{ member: UserProp }> = (props) => {
	const [itemSide, setItemSide] = useState<boolean>(false);
	const [userModal, setUserModal] = useState<boolean>(false);
	const navigate = useNavigate();
	const ctx = useContext(ChatContext);

	function changeItemSide(value: boolean) {
		setItemSide(value);
	}

	function sendGameInvite() {
		socket.emit("sendInvite", props.member.userId);
		navigate("/");
	}

	function changeUserModal() {
		setUserModal((prev) => {
			return !prev;
		});
		setItemSide(false);
	}

	if (ctx?.clientId === props.member.userId) {
		return (
			<div className={classes.itemLayout}>
				<img
					src={
						props.member?.profileImage
							? props.member.profileImage
							: props.member?.image_url
					}
					alt="Avatar"
					className={classes.badge}
				/>
				<div className={classes.name}>{props.member.username}</div>
			</div>
		);
	} else if (itemSide)
		return (
			<div
				className={classes.itemFlipLayout}
				onMouseLeave={() => {
					changeItemSide(false);
				}}
			>
				{userModal ? (
					<Modal title={props.member.username} onClick={changeUserModal}>
						<div className={classes.modal_userpage}>
							<UserContent userId={props.member.userId} />
						</div>
					</Modal>
				) : null}
				<div
					className={classes.button}
					onClick={() => {
						changeUserModal();
					}}
				>
					<img src="/user.svg" alt="user" />
				</div>
				<div
					className={classes.button}
					onClick={() => {
						sendGameInvite();
					}}
				>
					<img src="/pong.svg" alt="game" />
				</div>
			</div>
		);
	return (
		<div
			className={classes.itemLayout}
			onMouseEnter={() => {
				changeItemSide(true);
			}}
		>
			{userModal ? (
				<Modal title={props.member.username} onClick={changeUserModal}>
					<div className={classes.modal_userpage}>
						<UserContent userId={props.member.userId} />
					</div>
				</Modal>
			) : null}
			<img
				src={
					props.member?.profileImage
						? props.member.profileImage
						: props.member?.image_url
				}
				alt="Avatar"
				className={classes.badge}
			/>
			<div className={classes.name}>{props.member.username}</div>
		</div>
	);
};

export default NormalMemberItem;
