"use client";

import { useActionState, useState } from "react";

import {
  createApplicationAction,
  updateApplicationAction,
  type ApplicationFormState,
} from "@/server/actions/applications";
import { extractJobPostingAction } from "@/server/actions/job-extraction";
import { extractionToNotes } from "@/lib/job-posting-extraction";
import { formatDateInputValue } from "@/lib/dates";
import { FormField } from "@/components/ui/form-field";
import { ExternalLinkIcon } from "@/components/ui/external-link-icon";
import { Favicon } from "@/components/ui/favicon";
import { TextareaField } from "@/components/ui/textarea-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/application-status";
import { ApplicationStatus } from "@/generated/prisma";

type ApplicationFormValues = {
  id: string;
  company: string;
  position: string;
  jobUrl: string | null;
  salary: number | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  status: ApplicationStatus;
  technologies: string[];
  createdAt: Date;
  statusChangedAt: Date;
};

type ApplicationFormProps =
  | { mode: "create"; application?: undefined }
  | { mode: "edit"; application: ApplicationFormValues };

export function ApplicationForm({ mode, application }: ApplicationFormProps) {
  const action = mode === "create" ? createApplicationAction : updateApplicationAction;
  const [state, formAction, pending] = useActionState<ApplicationFormState, FormData>(
    action,
    undefined,
  );

  // Pré-remplissage assisté par IA (mode création uniquement) : on garde les
  // champs extraits à part plutôt que de piloter les <input> en contrôlé, et
  // on force leur remontage via `prefillKey` pour rafraîchir leur
  // `defaultValue` sans renoncer au pattern non-contrôlé du reste du
  // formulaire.
  const [jobUrlInput, setJobUrlInput] = useState("");
  // Valeur courante du champ "Lien de l'offre" (distinct de jobUrlInput
  // ci-dessus, propre au pré-remplissage par IA en mode création) : permet
  // de faire vivre l'aperçu du favicon à côté du champ au fil de la saisie,
  // y compris en mode édition.
  const [jobUrlValue, setJobUrlValue] = useState(application?.jobUrl ?? "");
  const [prefill, setPrefill] = useState<{
    company: string;
    position: string;
    salary: number | undefined;
    technologies: string;
    notes: string;
  } | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  async function handleExtract() {
    setExtracting(true);
    setExtractError(null);
    const result = await extractJobPostingAction(jobUrlInput);
    setExtracting(false);

    if (!result.success) {
      setExtractError(result.error);
      return;
    }

    setPrefill({
      company: result.data.company ?? "",
      position: result.data.position ?? "",
      salary: result.data.salary ?? undefined,
      technologies: result.data.technologies.join(", "),
      notes: extractionToNotes(result.data),
    });
    setJobUrlValue(jobUrlInput);
    setPrefillKey((key) => key + 1);
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {mode === "edit" && <input type="hidden" name="id" value={application.id} />}

      {mode === "create" && (
        <div className="flex flex-col gap-2 rounded-md border border-slate-700 bg-slate-800/50 p-3">
          <label htmlFor="extract-url" className="text-sm font-medium text-slate-200">
            Pré-remplir depuis une offre en ligne (LinkedIn, Jobgether, Free-Work...)
          </label>
          <div className="flex gap-2">
            <input
              id="extract-url"
              type="url"
              placeholder="https://..."
              value={jobUrlInput}
              onChange={(event) => setJobUrlInput(event.target.value)}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500"
            />
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || jobUrlInput.trim().length === 0}
              className="shrink-0 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {extracting ? "Extraction..." : "Extraire"}
            </button>
          </div>
          {extractError && (
            <p role="alert" className="text-sm text-red-400">
              {extractError}
            </p>
          )}
          {prefill && !extractError && (
            <p className="text-sm text-emerald-400">
              Champs pré-remplis ci-dessous : vérifie-les avant de valider.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          key={`company-${prefillKey}`}
          id="company"
          name="company"
          label="Entreprise"
          defaultValue={prefill?.company ?? application?.company}
          errors={state?.errors?.company}
        />
        <FormField
          key={`position-${prefillKey}`}
          id="position"
          name="position"
          label="Poste"
          defaultValue={prefill?.position ?? application?.position}
          errors={state?.errors?.position}
        />
      </div>

      <FormField
        id="jobUrl"
        name="jobUrl"
        label="Lien de l'offre"
        type="url"
        required={false}
        placeholder="https://..."
        value={jobUrlValue}
        onChange={(event) => setJobUrlValue(event.target.value)}
        errors={state?.errors?.jobUrl}
        trailingAddon={<Favicon key={jobUrlValue} url={jobUrlValue} size={20} className="shrink-0 rounded-sm" />}
        labelAddon={
          // Uniquement sur la valeur déjà enregistrée (pas la saisie en
          // cours, potentiellement invalide/non soumise). Le schéma Zod
          // n'accepte que des URL http(s) depuis le correctif ci-dessus,
          // mais on revérifie ici en défense en profondeur (données
          // enregistrées avant ce correctif, écriture directe en base...)
          // avant de rendre un <a href> cliquable.
          mode === "edit" &&
          application.jobUrl &&
          (application.jobUrl.startsWith("http://") ||
            application.jobUrl.startsWith("https://")) ? (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noreferrer noopener"
              title="Ouvrir le lien de l'offre dans un nouvel onglet"
              className="text-slate-400 hover:text-sky-400"
            >
              <span className="sr-only">Ouvrir le lien de l&apos;offre dans un nouvel onglet</span>
              <ExternalLinkIcon className="size-4" />
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="contactName"
          name="contactName"
          label="Nom du contact"
          required={false}
          defaultValue={application?.contactName ?? undefined}
        />
        <FormField
          id="contactEmail"
          name="contactEmail"
          label="E-mail du contact"
          type="email"
          required={false}
          defaultValue={application?.contactEmail ?? undefined}
          errors={state?.errors?.contactEmail}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          key={`salary-${prefillKey}`}
          id="salary"
          name="salary"
          label="Salaire annuel brut (€)"
          type="number"
          required={false}
          defaultValue={prefill?.salary ?? application?.salary ?? undefined}
          errors={state?.errors?.salary}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-200">
            Statut
          </label>
          <select
            id="status"
            name="status"
            defaultValue={application?.status ?? ApplicationStatus.TO_APPLY}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === "edit" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="createdAt"
            name="createdAt"
            label="Date de candidature"
            type="date"
            defaultValue={formatDateInputValue(application.createdAt)}
            errors={state?.errors?.createdAt}
          />
          <FormField
            id="statusChangedAt"
            name="statusChangedAt"
            label="Date de relance"
            type="date"
            defaultValue={formatDateInputValue(application.statusChangedAt)}
            errors={state?.errors?.statusChangedAt}
          />
        </div>
      )}

      <FormField
        key={`technologies-${prefillKey}`}
        id="technologies"
        name="technologies"
        label="Technologies (séparées par des virgules)"
        required={false}
        placeholder="React, Node.js, PostgreSQL"
        defaultValue={prefill ? prefill.technologies : application?.technologies.join(", ")}
      />

      <TextareaField
        key={`notes-${prefillKey}`}
        id="notes"
        name="notes"
        label="Notes"
        defaultValue={prefill?.notes ?? application?.notes ?? undefined}
      />

      {state?.message && (
        <p role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}

      <SubmitButton pending={pending}>
        {mode === "create" ? "Créer la candidature" : "Enregistrer les modifications"}
      </SubmitButton>
    </form>
  );
}
