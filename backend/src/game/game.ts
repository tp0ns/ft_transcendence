import Express from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Http = require('http').Server(Express);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SocketIo = require('socket.io')(Http, {
	cors: {
		origin: 'http://localhost:8080',
		methods: ['GET', 'POST'],
	},
});
// ci dessus: Permet de connecter deux url differentes, normalement CORS empeche cette connexion.
// 	autre utilisation possible : (quelque chose de cet ordre)
//	import Socket from 'socket.io';
//
// 	@webSocketGateway {
// 		cors: {
// 			origin: 'localhost'
// 		},
// 	},
//	Initial rectPosition of the rectangle
const rectPosition = {
	leftRectPosition: {
		x: 0,
		y: 50,
		w: 20,
		h: 100,
		speed: 5,
	},
	rightRectPosition: {
		x: 620,
		y: 200,
		w: 20,
		h: 100,
		speed: 20,
	},
};
// les valeurs 620 et 460 ne doivent pas etre constantes. il faut trouver un moyen de recuperer la taille du canvas
//	et de composer avec. ou alors utiliser vh/vw ou bien em au lieu de px

let ballPosition = {
	x: 250,
	y: 250,
	radius: 10,
	startAngle: 0,
	speedx: 5,
	speedy: 0,
	goRight: 0,
};

SocketIo.on('connection', (socket) => {
	SocketIo.emit(
		'setPosition',
		rectPosition.leftRectPosition,
		rectPosition.rightRectPosition,
		ballPosition,
	);

	// game functions
	socket.on('gameFunctions', (data) => {
		switch (data) {
			case 'resetBall':
				ballPosition.y = 250;
				ballPosition.x = 250;
				ballPosition.speedy = 0;
				ballPosition.goRight = 0;
				SocketIo.emit(
					'setPosition',
					rectPosition.leftRectPosition,
					rectPosition.rightRectPosition,
					ballPosition,
				);
				break;
		}
	});
	socket.on('ballMovement', (ballPos) => {
		ballPosition = ballPos;
		SocketIo.emit(
			'setPosition',
			rectPosition.leftRectPosition,
			rectPosition.rightRectPosition,
			ballPosition,
		);
	});

	// movements functions
	socket.on('move', (data) => {
		switch (data) {
			case 'up':
				if (
					rectPosition.rightRectPosition.y -
						rectPosition.rightRectPosition.speed <
					50
				)
					rectPosition.rightRectPosition.y = 50;
				else
					rectPosition.rightRectPosition.y -=
						rectPosition.rightRectPosition.speed;
				SocketIo.emit(
					'setPosition',
					rectPosition.leftRectPosition,
					rectPosition.rightRectPosition,
					ballPosition,
				);
				break;
			case 'down':
				if (
					rectPosition.rightRectPosition.y +
						rectPosition.rightRectPosition.speed >=
					433
				)
					rectPosition.rightRectPosition.y = 433;
				else
					rectPosition.rightRectPosition.y +=
						rectPosition.rightRectPosition.speed;
				SocketIo.emit(
					'setPosition',
					rectPosition.leftRectPosition,
					rectPosition.rightRectPosition,
					ballPosition,
				);
				break;
		}
	});
	socket.on('mouseMove', (mousePosy) => {
		// 	+50 because we build the pad 50px more than the coordinate so the mouse is located at the center of the pad
		if (mousePosy <= 0 + 50) rectPosition.leftRectPosition.y = 0 + 50;
		else if (mousePosy >= 383 + 50) rectPosition.leftRectPosition.y = 383 + 50;
		else rectPosition.leftRectPosition.y = mousePosy;
		SocketIo.emit(
			'setPosition',
			rectPosition.leftRectPosition,
			rectPosition.rightRectPosition,
			ballPosition,
		);
	});
});

Http.listen(3000, () => {
	console.log('Listening at: 3000...');
});
