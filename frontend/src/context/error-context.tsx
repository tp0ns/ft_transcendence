import React, { useEffect, useState } from "react";
import { socket } from "../App";
import ErrorBadge from "../components/Error/ErrorBadge";
import { ErrorContextType } from "../types/ErrorContextType";

const ErrorContext = React.createContext<ErrorContextType | null>(null);

export const ErrorContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		socket.on("errorEvent", (message) => {
			setError(message);
		});
	}, []);

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
			{error ? <ErrorBadge message={error} /> : null}
			{props.children}
		</ErrorContext.Provider>
	);
};

export default ErrorContext;
