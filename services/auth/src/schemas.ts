import { email } from './../node_modules/zod/src/v4/core/regexes';
import { z } from 'zod';

export const UserCreateSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(255),
	name: z.string().min(1).max(255),
})

export const UserLoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
})