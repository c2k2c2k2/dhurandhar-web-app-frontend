import { z } from "zod";

export const SaveAnswerSchema = z.record(z.string(), z.unknown());

export type SaveAnswerValues = z.infer<typeof SaveAnswerSchema>;
