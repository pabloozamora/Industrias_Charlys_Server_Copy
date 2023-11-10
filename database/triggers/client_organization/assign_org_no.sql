 /*Función para asignar el nuevo id a la tabla client_organization*/
 CREATE OR REPLACE FUNCTION assign_org_no()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_client_organization FROM 2) AS INTEGER) INTO prev_id_number FROM "client_organization" ORDER BY id_client_organization DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_client_organization = CONCAT('ORG', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 14, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_org_no ON "client_organization"; 
 CREATE TRIGGER tr_assign_org_no
 BEFORE INSERT
 ON "client_organization"
 FOR EACH ROW
 EXECUTE PROCEDURE assign_org_no();