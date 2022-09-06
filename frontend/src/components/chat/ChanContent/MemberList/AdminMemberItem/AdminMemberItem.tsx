import classes from "./AdminMemberItem.module.css";
import UserProp from "../../../../../interfaces/User.interface";
import { useContext, useState } from "react";
import ChatContext from "../../../../../context/chat-context";
import { socket } from "../../../../../App";
import Modal from "../../../../../ui/Modal/Modal";
import UserContent from "../../../../user/UserContent/UserContent";

const AdminMemberItem: React.FC<{ member: UserProp }> = (props) => {
	const [itemSide, setItemSide] = useState<boolean>(false);
	const [userModal, setUserModal] = useState<boolean>(false);
	const ctx = useContext(ChatContext);

	function changeItemSide(value: boolean) {
		setItemSide(value);
	}

	function isMuted() {
		return ctx?.activeChan?.mutedMembers.some((mutedMember) => {
			return props.member.userId === mutedMember.userId;
		});
	}

	function mute() {
		let modifyChan;
		if (isMuted()) {
			modifyChan = {
				title: ctx?.activeChan?.title,
				deleteMute: props.member.username,
			};
		} else {
			modifyChan = {
				title: ctx?.activeChan?.title,
				newMute: props.member.username,
			};
		}
		socket.emit("modifyChannel", modifyChan);
	}

	function makeAdmin() {
		const modifyChan = {
			title: ctx?.activeChan?.title,
			newAdmin: props.member.username,
		};
		socket.emit("modifyChannel", modifyChan);
	}

	function ban() {
		const modifyChan = {
			title: ctx?.activeChan?.title,
			newBan: props.member.username,
		};
		socket.emit("modifyChannel", modifyChan);
	}

	function changeUserModal() {
		setUserModal((prev) => {
			return !prev;
		});
		setItemSide(false);
	}

	if (itemSide)
		return (
			<div
				className={classes.itemFlipLayout}
				onMouseLeave={() => {
					changeItemSide(false);
				}}
			>
				{userModal ? (
					<Modal title={props.member.username} onClick={changeUserModal}>
						<UserContent userId={props.member.userId} />
					</Modal>
				) : null}
				<div
					className={classes.button}
					onClick={() => {
						changeUserModal();
					}}
				>
					<img src="user.svg" alt="user" />
				</div>
				<div className={classes.button}>
					<img src="pong.svg" alt="game" />
				</div>
				<div
					className={classes.button}
					onClick={() => {
						mute();
					}}
				>
					<img
						src={isMuted() ? "unmute.svg" : "mute.svg"}
						alt={isMuted() ? "unmute" : "mute"}
					/>
				</div>
				<div
					className={classes.button}
					onClick={() => {
						makeAdmin();
					}}
				>
					<img src="crown.svg" alt="make admin" />
				</div>
				<div
					className={classes.button}
					onClick={() => {
						ban();
					}}
				>
					<img src="ban.svg" alt="ban" />
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
					<UserContent userId={props.member.userId} />
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

export default AdminMemberItem;