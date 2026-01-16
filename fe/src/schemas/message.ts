import { z } from "zod";

export const promptMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty").max(10000),
});

export type PromptMessage = z.infer<typeof promptMessageSchema>;
