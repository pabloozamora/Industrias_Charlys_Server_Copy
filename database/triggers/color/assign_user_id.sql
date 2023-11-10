/*Función para asignar el nuevo id al color*/
 CREATE OR REPLACE FUNCTION assign_color_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_color FROM 4) AS INTEGER) INTO prev_id_number FROM color ORDER BY id_color DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_color = CONCAT('COL', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 12, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_color_id ON color; 
 CREATE TRIGGER tr_assign_color_id
 BEFORE INSERT
 ON color
 FOR EACH ROW
 EXECUTE PROCEDURE assign_color_id();