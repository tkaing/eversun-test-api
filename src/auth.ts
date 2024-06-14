import jwt from 'jsonwebtoken';
import { Next } from 'koa';
import { UserJwt } from './types/auth.types';
import { DbContext } from './types/koa.types';
import { getUserCollect } from './db';
import { JWT_EXPIRES_IN, SECRET_KEY } from './env.vars';

// Middleware to bypass everything
export const skip = async (_ctx: DbContext, next: Next) => {
	await next();
};

// Middleware to verify JWT token
export const verifyToken = async (ctx: DbContext, next: Next) => {
	const token = ctx.headers.authorization;

	if (!token) {
		ctx.status = 401;
		ctx.body = 'Unauthorized: Token missing';
		return;
	}

	try {
		const tokenWithoutBearer = token.split(' ')[1];
		const userJwt = jwt.verify(tokenWithoutBearer, SECRET_KEY) as UserJwt;
		const user = await getUserCollect(ctx.db).findOne({ email: userJwt.email });

		ctx.state.user = user;
		ctx.state.userId = user?._id.toString();
	} catch (err) {
		ctx.status = 401;
		ctx.body = `Unauthorized: Invalid token (${err})`;
		return;
	}

	await next();
};

// Middleware to generate JWT token
export const generateToken = (user: UserJwt) => {
	return jwt.sign(user, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRandomNumbers = (length: number) => {
	const charset = '0123456789';
	let result = '';
	const charsetLength = charset.length;

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charsetLength);
		result += charset.charAt(randomIndex);
	}

	return result;
};

export function generateUserCode(existingDbCodes: string[]) {
	let randomCode = generateRandomNumbers(4);

	while (existingDbCodes.includes(randomCode)) {
		randomCode = generateRandomNumbers(4);
	}

	return randomCode;
}
