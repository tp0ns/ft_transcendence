import React, { useEffect, useState } from "react";
import { socket } from "../App";
import ErrorBadge from "../components/Error/ErrorBadge";
import InviteItem from "../components/game/InviteItem/InviteItem";
import MatchInviteInterface from "../interfaces/MatchInvite.interface";
import { ErrorContextType } from "../types/ErrorContextType";
import classes from "./error-context.module.css";

const ErrorContext = React.createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [error, setError] = useState<string | null>(null);
	const [invites, setInvites] = useState<MatchInviteInterface[]>([]);

	useEffect(() => {
		socket.emit("retrieveInvitations");
		socket.on("errorEvent", (message) => {
			setError(message);
		});
		socket.on("sendBackInvite", (gameInvites) => {
			setInvites(gameInvites);
		});
		socket.on("updateInvitation", () => {
			socket.emit("retrieveInvitations");
		});
	}, []);

	useEffect(() => {
		const identifier = setTimeout(() => {
			socket.emit("retrieveInvitations");
		}, 10000);
		return () => {
			clearTimeout(identifier);
		};
	}, [invites]);

	useEffect(() => {
		const identifier = setTimeout(() => {
			setError(null);
		}, 2500);
		return () => {
			clearTimeout(identifier);
		};
	}, [error]);

	function changeError(newError: string | null) {
		setError(newError);
	}

	return (
		<ErrorContext.Provider
			value={{
				changeError: changeError,
			}}
		>
			<div className={classes.layout}>
				{error ? <ErrorBadge message={error} /> : null}
				{invites?.map((invite) => {
					return <InviteItem key={invite.id} invite={invite} />;
				})}
			</div>
			{props.children}
		</ErrorContext.Provider>
	);
};

export default ErrorContext;
