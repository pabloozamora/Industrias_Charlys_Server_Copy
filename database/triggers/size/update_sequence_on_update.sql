select * from "size" where "sequence" between least(2,4)+1 and greatest(2,4) order by "sequence" asc

select least(2,4)

CREATE OR REPLACE FUNCTION update_sequence_on_update()
RETURNS trigger AS
$BODY$
DECLARE 
	minValue INTEGER;
	maxValue INTEGER;
    row RECORD;
BEGIN
    IF NEW.sequence IS NOT NULL THEN
		minValue := LEAST(NEW.sequence, OLD.sequence) + 1;
		maxValue := GREATEST(NEW.sequence, OLD.sequence);
		IF (SELECT maxValue - minValue) < 1 THEN
			RETURN NEW;
        ELSEIF maxValue > (SELECT MAX("sequence") + 1 FROM "size") THEN
            NEW.sequence := nextval('size_sequence');
        ELSE
            FOR row IN (
                SELECT * FROM "size" WHERE "sequence" BETWEEN minValue and maxValue ORDER BY "sequence" DESC
            ) LOOP
                UPDATE "size" SET "sequence" = row.sequence + 1 WHERE "size" = row.size;
            END LOOP;
        END IF;
	ELSE
		NEW.sequence := nextval('size_sequence');
    END IF;
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

 DROP TRIGGER IF EXISTS tr_update_sequence_on_insert ON "size"; 
 CREATE TRIGGER tr_update_sequence_on_insert
 BEFORE INSERT
 ON "size"
 FOR EACH ROW
 EXECUTE PROCEDURE update_sequence_on_insert();