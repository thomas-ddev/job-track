import { z } from "zod";

import { ApplicationStatus } from "@/generated/prisma";

// Les champs optionnels arrivent du formulaire comme une chaîne vide plutôt
// que comme `undefined` (FormData ne distingue pas "champ absent" et "champ
// vide"). On normalise systématiquement "" en undefined avant validation.
const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(z.email({ error: "Adresse e-mail de contact invalide." }).optional())
  .optional();

// `z.url()` seul accepte n'importe quel schéma valide au sens WHATWG,
// y compris "javascript:" ou "data:" — un souci dès lors que ce champ est
// rendu comme lien cliquable (voir ApplicationForm). On restreint donc
// explicitement à http(s).
const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(
    z
      .url({ error: "Le lien de l'offre doit être une URL valide." })
      .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
        error: "Le lien de l'offre doit commencer par http:// ou https://.",
      })
      .optional(),
  )
  .optional();

// Le salaire arrive en chaîne depuis un <input type="number">. On valide le
// format par expression régulière plutôt que par `z.coerce.number()` : le
// typage de `coerce` dans Zod 4 n'accepte pas bien d'être chaîné après un
// `.transform()` qui change le type d'entrée en `string | undefined`.
const optionalSalary = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .refine((value) => value === undefined || /^\d+$/.test(value), {
    error: "Le salaire doit être un nombre entier positif.",
  })
  .transform((value) => (value === undefined ? undefined : Number(value)));

// Les technologies sont saisies comme une liste séparée par des virgules
// dans le formulaire, puis normalisées en tableau de noms uniques et non
// vides. La déduplication insensible à la casse se fait côté Server Action
// (upsert sur Technology.name), pas ici.
const technologiesField = z
  .string()
  .trim()
  .transform((value) =>
    value.length === 0
      ? []
      : value
          .split(",")
          .map((tech) => tech.trim())
          .filter((tech) => tech.length > 0),
  )
  .optional()
  .default([]);

export const applicationSchema = z.object({
  company: z.string().trim().min(1, { error: "L'entreprise est requise." }).max(200),
  position: z.string().trim().min(1, { error: "Le poste est requis." }).max(200),
  jobUrl: optionalUrl,
  salary: optionalSalary,
  contactName: optionalTrimmed,
  contactEmail: optionalEmail,
  notes: optionalTrimmed,
  status: z.enum(ApplicationStatus, { error: "Statut invalide." }),
  technologies: technologiesField,
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
