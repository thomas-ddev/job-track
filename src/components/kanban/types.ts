import type { ApplicationStatus } from "@/generated/prisma";

export type KanbanApplication = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  technologies: string[];
};
