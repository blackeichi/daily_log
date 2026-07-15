CREATE OR REPLACE FUNCTION fill_missing_daily_calorie_limits()
RETURNS TRIGGER AS $$
DECLARE
  profile_goal_calorie INTEGER;
  profile_maximum_calorie INTEGER;
BEGIN
  IF NEW."goalCalorie" IS NULL OR NEW."maximumCalorie" IS NULL THEN
    SELECT "goalCalorie", "maximumCalorie"
    INTO profile_goal_calorie, profile_maximum_calorie
    FROM "User"
    WHERE "id" = NEW."userId";

    NEW."goalCalorie" = COALESCE(NEW."goalCalorie", profile_goal_calorie);
    NEW."maximumCalorie" = COALESCE(
      NEW."maximumCalorie",
      profile_maximum_calorie
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_missing_daily_calorie_limits
BEFORE INSERT ON "Calorie"
FOR EACH ROW
EXECUTE FUNCTION fill_missing_daily_calorie_limits();
