import { useContext, useRef, useState } from "react";
import { socket } from "../../../../App";
import ChatContext from "../../../../context/chat-context";
import UserProp from "../../../../interfaces/User.interface";
import AdminMemberItem from "./AdminMemberItem/AdminMemberItem";
import BannedMemberItem from "./BannedMemberItem/BannedMemberItem";
import classes from "./MemberList.module.css";
import NormalMemberItem from "./NormalMemberItem/NormalMemberItem";

function MemberList() {
	const ctx = useContext(ChatContext);
	const newMember = useRef<HTMLInputElement>(null);

	function excludeAdmins(): UserProp[] {
		var result = ctx?.activeChan?.members.filter((member) => {
			return !ctx.activeChan?.admins.some((admin) => {
				return member.userId === admin.userId; // return the ones with equal id
			});
		});
		return result as UserProp[];
	}

	function handleNewMember(event: any) {
		event.preventDefault();
		const modifyChan = {
			title: ctx?.activeChan?.title,
			newMember: newMember.current?.value,
		};
		socket.emit("modifyChannel", modifyChan);
		newMember.current!.value = "";
	}

	return (
		<div className={classes.layout}>
			{ctx?.isAdmin && ctx?.activeChan?.private ? (
				<form onSubmit={handleNewMember} className={classes.search_bar}>
					<img src="adduser.svg" alt="Add user" />
					<input
						ref={newMember}
						type="text"
						id="addUser"
						placeholder="Add user and press Enter..."
						autoComplete="off"
					/>
				</form>
			) : null}
			<div className={classes.list}>
				{ctx?.activeChan?.admins.length ? (
					<div className={classes.category}>Admins</div>
				) : null}
				{ctx?.activeChan?.admins.map((admin) => {
					return <NormalMemberItem key={admin.userId} member={admin} />;
				})}
				<div className={classes.category}>Members</div>
				{excludeAdmins().map((member) => {
					if (!ctx?.isAdmin)
						return <NormalMemberItem key={member.userId} member={member} />;
					return <AdminMemberItem key={member.userId} member={member} />;
				})}
				{ctx?.activeChan?.bannedMembers.length !== 0 ? (
					<div className={classes.category}>Banned</div>
				) : null}
				{ctx?.activeChan?.bannedMembers.map((bannedMember) => {
					return (
						<BannedMemberItem key={bannedMember.userId} member={bannedMember} />
					);
				})}
			</div>
		</div>
	);
}

export default MemberList;
