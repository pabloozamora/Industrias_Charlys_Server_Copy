CREATE OR REPLACE FUNCTION update_sequence_on_delete()
RETURNS TRIGGER AS
$BODY$
DECLARE 
    row RECORD;
BEGIN
    IF OLD.sequence < (SELECT MAX("sequence") FROM "size") THEN
        FOR row IN (
            SELECT * FROM "size" WHERE "sequence" >= OLD.sequence ORDER BY "sequence" ASC
        ) LOOP
            UPDATE "size" SET "sequence" = row.sequence - 1 WHERE "size" = row.size;
        END LOOP;
    END IF;
    PERFORM setval('size_sequence', (SELECT MAX("sequence") FROM "size"));
    RETURN OLD;
END;
$BODY$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_sequence_on_delete ON "size"; 
CREATE TRIGGER tr_update_sequence_on_delete
AFTER DELETE
ON "size"
FOR EACH ROW
EXECUTE FUNCTION update_sequence_on_delete();
