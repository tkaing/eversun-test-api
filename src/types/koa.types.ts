import mqtt from 'mqtt';
import WebSocket from 'ws';
import { Db, WithId } from 'mongodb';
import { BaseContext, DefaultContext } from 'koa';

import { UserDb } from './db.types';

export type DbContext = BaseContext & DefaultContext & { db: Db };

export type WsContext = BaseContext & DefaultContext & { websocket: WebSocket };

export type LoggedContext = BaseContext &
	DefaultContext & { db: Db; mqttClient: mqtt.MqttClient; state: { user: WithId<UserDb> } };
