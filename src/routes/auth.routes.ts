import Router from 'koa-router';
import { Context, DefaultState } from 'koa';

import { UserDb } from '../types/db.types';
import { getUserCollect } from '../db';
import { DbContext, LoggedContext } from '../types/koa.types';
import { LoginOutput, RegisterOutput, UserJwt } from '../types/auth.types';
import { LoginInput, RegisterInput, UserInfoOutput } from '../types/auth.types';
import { generateToken, generateUserCode, skip, verifyToken } from '../auth';

const router = new Router<DefaultState, Context>({ prefix: '/api' });

/**
 * @POST /api/login
 * @PAYLOAD @type {LoginInput}
 */
router.post('/login', skip, async (ctx: DbContext) => {
	const input: LoginInput = ctx.request.body;

	const user = await getUserCollect(ctx.db).findOne({
		$or: [
			{
				name: input.username,
			},
			{
				email: input.username,
			},
		],
	});

	if (!user) {
		ctx.throw(404, 'user not found...');
	}

	if (user.code !== input.code) {
		ctx.throw(403, 'bad password...');
	}

	const userJwt: UserJwt = {
		name: user.name,
		email: user.email,
	};

	const token = generateToken(userJwt);

	const loginOutput: LoginOutput = {
		token: token,
	};

	ctx.body = { data: loginOutput };
});

/**
 * @POST /api/register
 * @PAYLOAD @type {RegisterInput}
 */
router.post('/register', skip, async (ctx: DbContext) => {
	const input: RegisterInput = ctx.request.body;

	const userCollect = getUserCollect(ctx.db);

	const userByName = await userCollect.findOne({
		name: input.name,
	});

	if (userByName) {
		ctx.throw(409, `user with name=${input.name} already exists...`);
	}

	const userByEmail = await userCollect.findOne({
		email: input.email,
	});

	if (userByEmail) {
		ctx.throw(409, `user with email=${input.email} already exists...`);
	}

	const usersWithCode = await userCollect.find({}).project<UserDb>({ code: 1 }).toArray();

	const existingDbCodes = usersWithCode.map(user => user.code);

	const persistedUser: UserDb = {
		code: generateUserCode(existingDbCodes),
		name: input.name,
		email: input.email,
	};

	const { acknowledged } = await userCollect.insertOne(persistedUser);

	if (!acknowledged) {
		ctx.throw(400, `oops! user cannot be registered...`);
	}

	const userJwt: UserJwt = {
		name: persistedUser.name,
		email: persistedUser.email,
	};

	const token = generateToken(userJwt);

	const registerOutput: RegisterOutput = {
		code: persistedUser.code,
		token: token,
	};

	ctx.body = { data: registerOutput };
});

/**
 * @GET /api/userinfo
 */
router.get('/userinfo', verifyToken, async (ctx: LoggedContext) => {
	const userinfo: UserInfoOutput = {
		name: ctx.state.user.name,
	};

	ctx.body = { data: userinfo };
});

export const AuthRouter = router;
