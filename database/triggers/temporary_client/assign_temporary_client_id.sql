/*Función para asignar el nuevo id al producto*/
 CREATE OR REPLACE FUNCTION assign_temporary_client_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_temporary_client FROM 3) AS INTEGER) INTO prev_id_number FROM temporary_client ORDER BY id_temporary_client DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_temporary_client = CONCAT('TC', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 13, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_temporary_client_id ON temporary_client; 
 CREATE TRIGGER tr_assign_temporary_client_id
 BEFORE INSERT
 ON temporary_client
 FOR EACH ROW
 EXECUTE PROCEDURE assign_temporary_client_id();