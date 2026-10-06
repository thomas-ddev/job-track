import { STATUS_LABELS } from "@/lib/application-status";
import type { ApplicationStatus } from "@/generated/prisma";

type StatusEventItem = {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  createdAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function StatusTimeline({ events }: { events: StatusEventItem[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 border-l-2 border-slate-700 pl-4">
          <div className="flex flex-col">
            <span className="text-sm text-slate-50">
              {event.fromStatus
                ? `${STATUS_LABELS[event.fromStatus]} → ${STATUS_LABELS[event.toStatus]}`
                : `Création — ${STATUS_LABELS[event.toStatus]}`}
            </span>
            <time dateTime={event.createdAt.toISOString()} className="text-xs text-slate-500">
              {dateFormatter.format(event.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
