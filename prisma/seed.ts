// Script de seed — à lancer avec `npm run db:seed`.
//
// Crée (ou recrée) un compte de démonstration avec un historique de
// candidatures réaliste, pour que le projet soit présentable immédiatement
// sans qu'un visiteur ait à remplir manuellement des données de test.
//
// `--env-file=.env` charge DATABASE_URL : comme pour scripts/reminders.ts,
// un script Node lancé directement ne lit pas .env automatiquement
// (contrairement à Next.js).

import bcrypt from "bcryptjs";

import { ApplicationStatus } from "@/generated/prisma";
import { db } from "@/lib/db";
import { DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_PASSWORD } from "@/lib/demo-account";

export const DEMO_USER_EMAIL = DEMO_ACCOUNT_EMAIL;
export const DEMO_USER_PASSWORD = DEMO_ACCOUNT_PASSWORD;

const DAY_MS = 24 * 60 * 60 * 1000;

// Une étape de l'historique d'une candidature : à `daysAgo` jours
// d'aujourd'hui, la candidature est passée au statut `status`. La première
// étape de chaque timeline correspond à la création de la candidature
// (fromStatus = null), les suivantes à des changements de statut successifs.
type TimelineStep = { status: ApplicationStatus; daysAgo: number };

type ApplicationSeed = {
  company: string;
  position: string;
  jobUrl?: string;
  salary?: number;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  technologies: string[];
  // Du plus ancien au plus récent.
  timeline: TimelineStep[];
};

// Vingt candidatures réalistes, à différents stades, pour peupler le Kanban,
// le tableau de bord (taux de réponse, délai moyen, répartition) et le
// système de relance (plusieurs candidatures "Envoyée" depuis plus de 10 jours).
const APPLICATIONS: ApplicationSeed[] = [
  {
    company: "Doctolib",
    position: "Développeur Full-Stack",
    jobUrl: "https://careers.doctolib.com/jobs/full-stack-developer",
    salary: 48000,
    technologies: ["Ruby on Rails", "React", "PostgreSQL"],
    notes: "Offre repérée via le site carrière, à postuler avant la fin de la semaine.",
    timeline: [{ status: ApplicationStatus.TO_APPLY, daysAgo: 2 }],
  },
  {
    company: "Alan",
    position: "Ingénieur Backend",
    jobUrl: "https://jobs.alan.com/backend-engineer",
    salary: 52000,
    technologies: ["Scala", "Kafka", "PostgreSQL"],
    timeline: [{ status: ApplicationStatus.TO_APPLY, daysAgo: 1 }],
  },
  {
    company: "Back Market",
    position: "Développeur Front-end React",
    salary: 45000,
    technologies: ["React", "TypeScript", "GraphQL"],
    notes: "Recommandé par un ancien collègue, préparer un message de motivation personnalisé.",
    timeline: [{ status: ApplicationStatus.TO_APPLY, daysAgo: 5 }],
  },
  {
    company: "PayFit",
    position: "Ingénieur Logiciel",
    salary: 47000,
    technologies: ["PHP", "Symfony", "MySQL"],
    timeline: [{ status: ApplicationStatus.TO_APPLY, daysAgo: 3 }],
  },

  {
    company: "Qonto",
    position: "Développeur Full-Stack",
    jobUrl: "https://qonto.com/careers/full-stack-developer",
    salary: 50000,
    contactName: "Camille Dubois",
    contactEmail: "camille.dubois@qonto.com",
    technologies: ["Node.js", "React", "TypeScript"],
    notes: "Entretien RH passé rapidement, en attente de retour depuis un moment.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 15 },
      { status: ApplicationStatus.APPLIED, daysAgo: 12 },
    ],
  },
  {
    company: "Spendesk",
    position: "Backend Engineer",
    salary: 49000,
    technologies: ["Python", "Django", "PostgreSQL"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 18 },
      { status: ApplicationStatus.APPLIED, daysAgo: 15 },
    ],
  },
  {
    company: "Swile",
    position: "Frontend Engineer",
    salary: 44000,
    technologies: ["Vue.js", "TypeScript"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 6 },
      { status: ApplicationStatus.APPLIED, daysAgo: 4 },
    ],
  },
  {
    company: "Ledger",
    position: "Développeur Blockchain",
    jobUrl: "https://www.ledger.com/careers/blockchain-developer",
    salary: 55000,
    technologies: ["Go", "Rust"],
    notes: "Candidature spontanée après une rencontre en meetup.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 23 },
      { status: ApplicationStatus.APPLIED, daysAgo: 20 },
    ],
  },
  {
    company: "Mirakl",
    position: "Ingénieur Plateforme",
    salary: 51000,
    technologies: ["Java", "Spring Boot", "Kubernetes"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 4 },
      { status: ApplicationStatus.APPLIED, daysAgo: 2 },
    ],
  },
  {
    company: "Contentsquare",
    position: "Développeur Full-Stack / Data",
    salary: 50000,
    technologies: ["Python", "React", "AWS"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 10 },
      { status: ApplicationStatus.APPLIED, daysAgo: 8 },
    ],
  },

  {
    company: "OVHcloud",
    position: "Développeur Cloud",
    jobUrl: "https://careers.ovhcloud.com/cloud-developer",
    salary: 46000,
    contactName: "Julien Mercier",
    contactEmail: "j.mercier@ovhcloud.com",
    technologies: ["Go", "Kubernetes", "Docker"],
    notes: "Premier entretien technique prévu — revoir les bases de Kubernetes avant.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 30 },
      { status: ApplicationStatus.APPLIED, daysAgo: 25 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 10 },
    ],
  },
  {
    company: "Dataiku",
    position: "Software Engineer",
    salary: 53000,
    technologies: ["Java", "Python", "React"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 40 },
      { status: ApplicationStatus.APPLIED, daysAgo: 35 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 20 },
    ],
  },
  {
    company: "Criteo",
    position: "Backend Engineer",
    salary: 54000,
    technologies: ["C#", ".NET", "SQL Server"],
    notes: "Deuxième entretien (technique) à préparer, prévoir un exercice de code.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 25 },
      { status: ApplicationStatus.APPLIED, daysAgo: 22 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 5 },
    ],
  },
  {
    company: "Younited",
    position: "Fullstack Engineer",
    salary: 48000,
    technologies: ["Node.js", "Vue.js", "MySQL"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 18 },
      { status: ApplicationStatus.APPLIED, daysAgo: 15 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 3 },
    ],
  },

  {
    company: "BlaBlaCar",
    position: "Senior Backend Engineer",
    jobUrl: "https://blablacar.careers/senior-backend-engineer",
    salary: 58000,
    contactName: "Sophie Lambert",
    contactEmail: "sophie.lambert@blablacar.com",
    technologies: ["Java", "Kafka", "PostgreSQL"],
    notes: "Promesse d'embauche reçue, en cours de négociation du salaire.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 60 },
      { status: ApplicationStatus.APPLIED, daysAgo: 55 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 40 },
      { status: ApplicationStatus.OFFER, daysAgo: 20 },
    ],
  },
  {
    company: "Algolia",
    position: "Développeur Full-Stack",
    salary: 56000,
    technologies: ["React", "Node.js", "TypeScript"],
    notes: "Offre reçue, date limite de réponse dans deux semaines.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 50 },
      { status: ApplicationStatus.APPLIED, daysAgo: 45 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 30 },
      { status: ApplicationStatus.OFFER, daysAgo: 10 },
    ],
  },
  {
    company: "PrestaShop",
    position: "Ingénieur Logiciel",
    salary: 49000,
    technologies: ["PHP", "Symfony", "MySQL"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 70 },
      { status: ApplicationStatus.APPLIED, daysAgo: 65 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 50 },
      { status: ApplicationStatus.OFFER, daysAgo: 35 },
    ],
  },

  {
    company: "Deezer",
    position: "Développeur Backend",
    salary: 47000,
    technologies: ["Python", "Django", "AWS"],
    notes:
      "Refus après l'entretien technique — feedback : manque d'expérience sur l'audio streaming.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 45 },
      { status: ApplicationStatus.APPLIED, daysAgo: 40 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 30 },
      { status: ApplicationStatus.REJECTED, daysAgo: 15 },
    ],
  },
  {
    company: "Leboncoin",
    position: "Ingénieur Full-Stack",
    salary: 48000,
    technologies: ["React", "Java", "Kafka"],
    notes: "Refus après la présélection CV, pas d'entretien accordé.",
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 35 },
      { status: ApplicationStatus.APPLIED, daysAgo: 30 },
      { status: ApplicationStatus.REJECTED, daysAgo: 20 },
    ],
  },
  {
    company: "ManoMano",
    position: "Développeur React Native",
    salary: 46000,
    technologies: ["React Native", "TypeScript"],
    timeline: [
      { status: ApplicationStatus.TO_APPLY, daysAgo: 55 },
      { status: ApplicationStatus.APPLIED, daysAgo: 50 },
      { status: ApplicationStatus.INTERVIEW, daysAgo: 35 },
      { status: ApplicationStatus.REJECTED, daysAgo: 25 },
    ],
  },
];

function dateDaysAgo(daysAgo: number, now: Date): Date {
  return new Date(now.getTime() - daysAgo * DAY_MS);
}

function dedupeTechnologyNames(names: string[]): string[] {
  const byLowerCase = new Map<string, string>();
  for (const name of names) {
    byLowerCase.set(name.toLowerCase(), name);
  }
  return Array.from(byLowerCase.values());
}

async function main() {
  const now = new Date();

  // Idempotent : relancer le seed supprime et recrée le compte de
  // démonstration plutôt que d'accumuler des doublons à chaque exécution.
  // La suppression en cascade (onDelete: Cascade sur toutes les relations
  // enfants, voir schema.prisma) nettoie candidatures, événements et
  // notifications en même temps que l'utilisateur.
  await db.user.deleteMany({ where: { email: DEMO_USER_EMAIL } });

  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  const user = await db.user.create({
    data: { email: DEMO_USER_EMAIL, passwordHash, name: "Démo JobTrack" },
  });

  for (const seed of APPLICATIONS) {
    const firstStep = seed.timeline[0];
    const lastStep = seed.timeline[seed.timeline.length - 1];
    if (!firstStep || !lastStep) continue;

    await db.$transaction(async (tx) => {
      const technologyIds: string[] = [];
      for (const name of dedupeTechnologyNames(seed.technologies)) {
        const technology = await tx.technology.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        technologyIds.push(technology.id);
      }

      const application = await tx.application.create({
        data: {
          userId: user.id,
          company: seed.company,
          position: seed.position,
          jobUrl: seed.jobUrl,
          salary: seed.salary,
          contactName: seed.contactName,
          contactEmail: seed.contactEmail,
          notes: seed.notes,
          status: lastStep.status,
          createdAt: dateDaysAgo(firstStep.daysAgo, now),
          updatedAt: dateDaysAgo(lastStep.daysAgo, now),
          technologies: {
            create: technologyIds.map((technologyId) => ({ technologyId })),
          },
        },
      });

      for (let i = 0; i < seed.timeline.length; i++) {
        const step = seed.timeline[i];
        if (!step) continue;
        const previousStep = i > 0 ? seed.timeline[i - 1] : undefined;

        await tx.statusEvent.create({
          data: {
            applicationId: application.id,
            fromStatus: previousStep?.status ?? null,
            toStatus: step.status,
            createdAt: dateDaysAgo(step.daysAgo, now),
          },
        });
      }
    });
  }

  console.log(
    `Compte de démonstration créé : ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD} (${APPLICATIONS.length} candidatures).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Échec du seed :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
