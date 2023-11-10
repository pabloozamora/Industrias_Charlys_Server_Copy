CREATE OR REPLACE FUNCTION update_sequence_on_insert()
RETURNS trigger AS
$BODY$
DECLARE 
    row RECORD;
BEGIN
    IF NEW.sequence IS NOT NULL THEN
        IF NEW.sequence > (SELECT MAX("sequence") + 1 FROM "size") THEN
            NEW.sequence := nextval('size_sequence') + 1;
        ELSE
            FOR row IN (
                SELECT * FROM "size" WHERE "sequence" >= NEW.sequence ORDER BY "sequence" DESC
            ) LOOP
                UPDATE "size" SET "sequence" = row.sequence + 1 WHERE "size" = row.size;
            END LOOP;
        END IF;
	ELSE
		NEW.sequence := nextval('size_sequence');
    END IF;
	PERFORM setval('size_sequence',(SELECT MAX("sequence")from "size"));
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