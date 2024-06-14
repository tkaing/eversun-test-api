import Router from 'koa-router';
import { Context, DefaultState } from 'koa';

import { verifyToken } from '../auth';
import { LoggedContext } from '../types/koa.types';
import { getHistoryCollect } from '../db';
import { getTopicWithDevice } from '../helpers/device.helpers';

const router = new Router<DefaultState, Context>({ prefix: '/api/device' });

/** @GET /api/device/history/:deviceName */
router.get('/history/:deviceName', verifyToken, async (ctx: LoggedContext) => {
	const user = ctx.state.user;
	const deviceName = ctx.params.deviceName;

	const rows = await getHistoryCollect(ctx.db)
		.find({ deviceName: `${user.name}-${deviceName}` })
		.sort({ createdAt: -1 })
		.toArray();

	ctx.body = { data: rows };
});

/** @POST /api/device/update/:deviceName */
router.post('/update/:deviceName', verifyToken, async (ctx: LoggedContext) => {
	const user = ctx.state.user;
	const deviceName = ctx.params.deviceName;
	const requestBody: any = ctx.request.body;

	const mqttMessage = requestBody;

	const lastestRows = await getHistoryCollect(ctx.db)
		.find({ deviceName: `${user.name}-${deviceName}` })
		.sort({ createdAt: -1 })
		.limit(1)
		.toArray();

	if (lastestRows.length === 0) {
		ctx.status = 404;
		ctx.body = { message: 'no history found...' };
		return;
	}

	const lastRow = lastestRows[0];

	const savedRow = {
		...lastRow,
		...mqttMessage,
	};

	if (ctx.mqttClient.disconnected) {
		throw 'Cannot reach mqtt broker...';
	}

	ctx.mqttClient.publish(`${getTopicWithDevice(user.name, deviceName)}/set`, JSON.stringify(savedRow), {
		qos: 0,
		retain: false,
	});

	ctx.body = { data: savedRow };
});

/** @POST /api/device/topic/:deviceName */
router.post('/topic/:deviceName', verifyToken, async (ctx: LoggedContext) => {
	const user = ctx.state.user;
	const deviceName = ctx.params.deviceName;

	if (ctx.mqttClient.disconnected) {
		throw 'Cannot reach mqtt broker...';
	}

	const subscriptionTopic = `${getTopicWithDevice(user.name, deviceName)}/#`;

	if (ctx.mqttSubscriptions.includes(subscriptionTopic)) {
		ctx.body = { message: `(ALREADY) Subscribed to the topic : ${subscriptionTopic}` };
		return;
	}

	ctx.mqttClient.subscribe(subscriptionTopic);
	ctx.mqttSubscriptions.push(subscriptionTopic);

	ctx.body = { message: `Subscribed to the topic : ${subscriptionTopic}` };
});

export const DeviceRouter = router;
