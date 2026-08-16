import { z } from "zod";

/**
 * Zod schema for contact form validation.
 * Requires non-empty name, valid email, and non-empty message.
 * Exported for use on both client and server.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be 100 characters or fewer" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  message: z
    .string()
    .min(1, { message: "Message is required" })
    .max(5000, { message: "Message must be 5000 characters or fewer" }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
