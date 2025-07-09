import { z } from "zod";

const EmailCreateSchema = z.object({
  sender: z.string().email().optional(),
  recipient: z.string().email(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  source: z.string().optional(),
});


export default EmailCreateSchema;