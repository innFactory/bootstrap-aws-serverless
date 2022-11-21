import jwt from 'jsonwebtoken';

export const getJWT = (vo: string) => {
	const token = jwt.sign(
		{
			sub: '1234567890',
			name: 'John Doe',
			iat: Date.now(),
			vo: vo,
			username: 'test@test.de',
		},
		'secret'
	);
	return token;
};
