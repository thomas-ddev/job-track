-- AlterTable
ALTER TABLE `applications` ADD COLUMN `statusChangedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Backfill : pour les candidatures existantes, reprend la date du dernier
-- événement de statut déjà enregistré plutôt que de laisser la date de
-- migration (plus fidèle à la réalité que "maintenant" pour des données
-- préexistantes).
UPDATE `applications` a
JOIN (
  SELECT `applicationId`, MAX(`createdAt`) AS `lastStatusAt`
  FROM `status_events`
  GROUP BY `applicationId`
) latest ON latest.`applicationId` = a.`id`
SET a.`statusChangedAt` = latest.`lastStatusAt`;

