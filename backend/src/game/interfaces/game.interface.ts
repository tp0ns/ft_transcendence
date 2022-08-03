interface pad {
	x: number;
	y: number;
	w: number;
	h: number;
	speed: number;
}

interface ball {
	x: number;
	y: number;
	radius: number;
	startAngle: number;
	speedx: number;
	speedy: number;
	goRight: boolean;
}

export default pad;
