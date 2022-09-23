import classes from "./AdminMemberItem.module.css";
import UserProp from "../../../../../interfaces/User.interface";
import { useContext, useEffect, useState } from "react";
import ChatContext from "../../../../../context/chat-context";
import { socket } from "../../../../../App";
import Modal from "../../../../../ui/Modal/Modal";
import UserContent from "../../../../user/UserContent/UserContent";
import { Navigate, useNavigate } from "react-router-dom";

const AdminMemberItem: React.FC<{ member: UserProp }> = (props) => {
	const [itemSide, setItemSide] = useState<boolean>(false);
	const [userModal, setUserModal] = useState<boolean>(false);
	const navigate = useNavigate();
	const ctx = useContext(ChatContext);

	useEffect(() => {
		socket.on("receivedInvite", () => {
			navigate("/waiting");
		});
	}, []);

	function changeItemSide(value: boolean) {
		setItemSide(value);
	}

	function sendGameInvite() {
		socket.emit("sendInvite", props.member.userId);
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
				id: ctx?.activeChan?.channelId,
				deleteMute: props.member.userId,
			};
		} else {
			modifyChan = {
				id: ctx?.activeChan?.channelId,
				newMute: props.member.userId,
			};
		}
		socket.emit("modifyChannel", modifyChan);
	}

	function makeAdmin() {
		const modifyChan = {
			id: ctx?.activeChan?.channelId,
			newAdmin: props.member.userId,
		};
		socket.emit("modifyChannel", modifyChan);
	}

	function ban() {
		const modifyChan = {
			id: ctx?.activeChan?.channelId,
			newBan: props.member.userId,
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
				<div
					className={classes.button}
					onClick={() => {
						mute();
					}}
				>
					<img
						src={isMuted() ? "/unmute.svg" : "/mute.svg"}
						alt={isMuted() ? "/unmute" : "/mute"}
					/>
				</div>
				<div
					className={classes.button}
					onClick={() => {
						makeAdmin();
					}}
				>
					<img src="/crown.svg" alt="make admin" />
				</div>
				<div
					className={classes.button}
					onClick={() => {
						ban();
					}}
				>
					<img src="/ban.svg" alt="ban" />
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

export default AdminMemberItem;
