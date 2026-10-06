import { z } from "zod";

export const jobExtractionDataSchema = z.object({
  company: z.string().trim().min(1).max(200).nullable(),
  position: z.string().trim().min(1).max(200).nullable(),
  location: z.string().trim().max(200).nullable(),
  contractType: z.string().trim().max(100).nullable(),
  remote: z.string().trim().max(100).nullable(),
  salary: z.number().int().positive().nullable(),
  technologies: z.array(z.string().trim().min(1)).max(30),
  summary: z.string().trim().max(2000).nullable(),
});

export type JobExtractionData = z.infer<typeof jobExtractionDataSchema>;
