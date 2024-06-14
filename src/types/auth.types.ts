export type UserJwt = {
	name: string;
	email: string;
};

export type LoginInput = {
	code: string;
	username: string;
};

export type RegisterInput = {
	name: string;
	email: string;
};

export type LoginOutput = {
	token: string;
};

export type RegisterOutput = {
	code: string;
	token: string;
};

export type UserInfoOutput = {
	name: string;
};
