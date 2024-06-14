import Koa from 'koa';
import mqtt from 'mqtt';
import cors from '@koa/cors';
import Router from 'koa-router';
import websockify from 'koa-websocket';
import { WebSocket } from 'ws';
import { bodyParser } from '@koa/bodyparser';
import { MongoClient } from 'mongodb';

import { WsContext } from './types/koa.types';
import { AuthRouter } from './routes/auth.routes';
import { HistoryRowDb } from './types/db.types';
import { DeviceRouter } from './routes/device.routes';
import { getDeviceName } from './helpers/device.helpers';
import { historyRowSchema } from './schemas';
import { getHistoryCollect } from './db';
import { DATABASE_NAME, DATABASE_URL, DEFAULT_ROOT_TOPIC, MQTT_BROKER_HOST, PORT } from './env.vars';

const app = websockify(new Koa());
const wsRoute = new Router();
const wsClients: WebSocket[] = [];
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER_HOST}`, { protocol: 'mqtt' });
const mongoDatabase = new MongoClient(DATABASE_URL).db(DATABASE_NAME);

app.context.db = mongoDatabase;
app.context.mqttClient = mqttClient;
app.context.mqttSubscriptions = [];

app.use(cors());
app.use(bodyParser());

app.ws
	.use(
		wsRoute
			.all('/ws', function (ctx: WsContext) {
				console.log('Connected to WebSocket');
				wsClients.splice(0, wsClients.length);
				wsClients.push(ctx.websocket);
			} as any)
			.routes() as any
	)
	.use(wsRoute.allowedMethods() as any);

mqttClient.on('connect', () => {
	console.log('Connected to MQTT broker');
});

mqttClient.on('disconnect', () => {
	console.log('Disconnected from MQTT broker');
});

mqttClient.on('message', (topic, message) => {
	const mqttMessage = JSON.parse(message.toString());

	if (new RegExp(`^${DEFAULT_ROOT_TOPIC}\/[a-zA-Z0-9-]+\/set$`).test(topic)) {
		const websocket = wsClients[0];
		const deviceName = getDeviceName(topic);

		historyRowSchema
			.parseAsync(mqttMessage)
			.then(mqttHistoryRow => {
				const savedHistoryRow: HistoryRowDb = {
					...mqttHistoryRow,
					createdAt: new Date(),
					deviceName: deviceName,
				};

				getHistoryCollect(mongoDatabase).insertOne(savedHistoryRow);

				if (websocket) {
					websocket.send(JSON.stringify(savedHistoryRow));
				}
			})
			.catch(err => {
				console.log(err);
			});
	}
});

app.use(AuthRouter.routes());
app.use(AuthRouter.allowedMethods());

app.use(DeviceRouter.routes());
app.use(DeviceRouter.allowedMethods());

app.on('error', (err, ctx) => {
	console.error('server error', err);
});

app.listen(PORT, () => {
	console.log(`🚀 Server is running on port http://localhost:${PORT}/`);
});
