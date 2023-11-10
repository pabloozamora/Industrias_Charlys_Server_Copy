/*Función para asignar el nuevo id a la tabla solicitud de orden*/
 CREATE OR REPLACE FUNCTION assign_order_request_no()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_order_request FROM 3) AS INTEGER) INTO prev_id_number FROM order_request ORDER BY id_order_request DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_order_request = CONCAT('OR', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 13, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_request_no ON order_request; 
 CREATE TRIGGER tr_assign_request_no
 BEFORE INSERT
 ON order_request
 FOR EACH ROW
 EXECUTE PROCEDURE assign_order_request_no();