import { DEFAULT_ROOT_TOPIC } from '../env.vars';

export const getDeviceName = (topic: string) => {
	return topic.split('/')[1];
};

export const getTopicWithDevice = (username: string, deviceName: string) => {
	return `${DEFAULT_ROOT_TOPIC}/${username}-${deviceName}`;
};
