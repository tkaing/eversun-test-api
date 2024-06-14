import { Db } from 'mongodb';
import { UserDb, HistoryRowDb } from './types/db.types';

export const getUserCollect = (db: Db) => {
	return db.collection<UserDb>('user');
};

export const getHistoryCollect = (db: Db) => {
	return db.collection<HistoryRowDb>('history');
};
