import { StateType } from "./basis.types";

export type UserDb = {
	name: string;
	code: string;
	email: string;
};

export type HistoryRowDb = {
	state: StateType;
	createdAt: Date;
	deviceName: string;
	currentPower: string;
	totalPowerConsumption: string;
};
