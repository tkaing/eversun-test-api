import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3001;

export const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';

export const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://local:local@localhost:27017/?authMechanism=DEFAULT';

export const DATABASE_NAME = process.env.DATABASE_NAME || 'eversun-test';

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export const MQTT_BROKER_HOST = process.env.MQTT_BROKER_HOST || 'localhost';

export const DEFAULT_ROOT_TOPIC = 'tkgtest';
