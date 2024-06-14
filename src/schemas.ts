import { z } from 'zod';

export const historyRowSchema = z.object({
	state: z.enum(['ON', 'OFF']),
	deviceName: z
		.string({
			required_error: `'deviceName' est requis`,
			invalid_type_error: `'deviceName' doit être une chaîne.`,
		})
		.min(1, `'deviceName' est requis`),
	currentPower: z
		.string({
			required_error: `'currentPower' est requis`,
			invalid_type_error: `'currentPower' doit être une chaîne.`,
		})
		.min(1, `'currentPower' est requis`),
	totalPowerConsumption: z
		.string({
			required_error: `'totalPowerConsumption' est requis`,
			invalid_type_error: `'totalPowerConsumption' doit être une chaîne.`,
		})
		.min(1, `'totalPowerConsumption' est requis`),
});
