import jwt from 'jsonwebtoken';

export const getJWT = () => {
	const token = jwt.sign(
		{
			sub: '1234567890',
			name: 'John Doe',
			iat: Date.now(),
		},
		'secret'
	);
	return token;
};
