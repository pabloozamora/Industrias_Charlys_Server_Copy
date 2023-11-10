/*Función para asignar el nuevo id a la tabla orden*/
 CREATE OR REPLACE FUNCTION assign_order_no()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_order FROM 2) AS INTEGER) INTO prev_id_number FROM "order" ORDER BY id_order DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_order = CONCAT('O', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 14, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_order_no ON "order"; 
 CREATE TRIGGER tr_assign_order_no
 BEFORE INSERT
 ON "order"
 FOR EACH ROW
 EXECUTE PROCEDURE assign_order_no();