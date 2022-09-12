import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { Cookies } from 'react-cookie';

export default function Debug() {

	const [event, setEvent] = useState("");
	const [args, setArgs] = useState("");
	const [args2, setArgs2] = useState("");
	const [response, setResponse] = useState("");
	const [data, setData] = useState<any>([]);
	const [socket, setSocket] = useState<any>([]);

	useEffect(
		() => {
			const socket = io();
			setSocket(socket);

			socket.onAny((event, ...args) => {
				setResponse(event);
				setData(args);
			});

		}, []);

	function syntaxHighlight(json: any) {
		if (!json) return ""; //no JSON from response

		json = json
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		return json.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+]?\d+)?)/g,
			function (match: any) {
				var cls = "number";
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = "key";
					} else {
						cls = "string";
					}
				} else if (/true|false/.test(match)) {
					cls = "boolean";
				} else if (/null/.test(match)) {
					cls = "null";
				}
				return '<span class="' + cls + '">' + match + "</span>";
			}
		);
	}

	let handleSubmit = (e: any) => {
		e.preventDefault();

		if (event && args && args2)
			socket.emit(event, args, args2);
		else if (event && args)
			socket.emit(event, args);
		else if (event === "joinRoom")
			socket.emit('joinRoom', { chanName: "Test normal" });
		else if (event === "joinRoom1")
			socket.emit('joinRoom', { chanName: "Test password" }); // must fail
		else if (event === "joinRoom2")
			socket.emit('joinRoom', { chanName: "Test password", password : "kiki" }); // must fail
		else if (event === "joinRoom3")
			socket.emit('joinRoom', { chanName: "Test password", password : "root" }); // must succeed
		else if (event === "createRoom")
			socket.emit('createRoom', { chanName: "Test normal" } );
		else if (event === "createRoom1")
			socket.emit('createRoom', { chanName : "Test private", private : true});
		else if (event === "createRoom2")
			socket.emit('createRoom', { chanName : "Test password", password : "root"});
		else if (event === "privateMessage")
			socket.emit('privateMessage', { to: { name: "ccommiss" } , msg : "lol"})
		else if (event)
			socket.emit(event);

		setData("");
		setResponse("");

	}

	let clearArgs = (e: any) => {
		setEvent("");
		setArgs("");
		setArgs2("");
	}

	let createSelectItems = () => {
		let items = [];
		const users = Object.keys(localStorage);

		items.push(<option value="">User</option>);

		for (let user of users)
		{
			items.push(<option value={user}>{user}</option>);
		}

		return items;
	}

	let onDropdownSelected = (e: any) => {
		console.log("THE VAL", e.target.value);
		const cookies = new Cookies();
		cookies.set("Authentication", localStorage.getItem(e.target.value), { path: '/' });
	}

	let reloadCookie = () => {
		window.location.reload();
	}

	return (
		<div className='debug'>
			<select onChange={onDropdownSelected}>
				{createSelectItems()}
			</select>
			<button type="button" onClick={reloadCookie}>Set user</button>
			<br/>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={event}
					placeholder="Event"
					onChange={(e) => setEvent(e.target.value)}
				/>
				<input
					type="text"
					value={args}
					placeholder="Args"
					onChange={(e) => setArgs(e.target.value)}
				/>
				<input
					type="text"
					value={args2}
					placeholder="Args2"
					onChange={(e) => setArgs2(e.target.value)}
				/>
				<button type="submit">Send</button>
				<button type="button" onClick={clearArgs}>Clear</button>
			</form>
			<h3>
				{response}
			</h3>
			<pre
				dangerouslySetInnerHTML={{
					__html: syntaxHighlight(JSON.stringify(data, null, 4))
				}}
			/>
		</div>
	)
}
