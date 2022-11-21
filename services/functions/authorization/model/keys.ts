export interface Keys {
	keys: Key[];
}

interface Key {
	kty: string;
	kid: string;
	use: string;
	x: string;
	y: string;
	crv: string;
	iat: number;
	exp: number;
}
