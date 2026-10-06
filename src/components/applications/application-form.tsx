"use client";

import { useActionState } from "react";

import {
  createApplicationAction,
  updateApplicationAction,
  type ApplicationFormState,
} from "@/server/actions/applications";
import { FormField } from "@/components/ui/form-field";
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

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {mode === "edit" && <input type="hidden" name="id" value={application.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="company"
          name="company"
          label="Entreprise"
          defaultValue={application?.company}
          errors={state?.errors?.company}
        />
        <FormField
          id="position"
          name="position"
          label="Poste"
          defaultValue={application?.position}
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
        defaultValue={application?.jobUrl ?? undefined}
        errors={state?.errors?.jobUrl}
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
          id="salary"
          name="salary"
          label="Salaire annuel brut (€)"
          type="number"
          required={false}
          defaultValue={application?.salary ?? undefined}
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

      <FormField
        id="technologies"
        name="technologies"
        label="Technologies (séparées par des virgules)"
        required={false}
        placeholder="React, Node.js, PostgreSQL"
        defaultValue={application?.technologies.join(", ")}
      />

      <TextareaField
        id="notes"
        name="notes"
        label="Notes"
        defaultValue={application?.notes ?? undefined}
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
