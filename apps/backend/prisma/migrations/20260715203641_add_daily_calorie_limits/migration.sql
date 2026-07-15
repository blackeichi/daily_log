-- Add the daily limits as nullable columns so existing records can be backfilled.
ALTER TABLE "Calorie"
ADD COLUMN "goalCalorie" INTEGER,
ADD COLUMN "maximumCalorie" INTEGER;

-- Snapshot each record owner's current profile limits into their existing dates.
UPDATE "Calorie" AS calorie
SET
  "goalCalorie" = "User"."goalCalorie",
  "maximumCalorie" = "User"."maximumCalorie"
FROM "User"
WHERE calorie."userId" = "User"."id";

ALTER TABLE "Calorie"
ALTER COLUMN "goalCalorie" SET NOT NULL,
ALTER COLUMN "maximumCalorie" SET NOT NULL;
