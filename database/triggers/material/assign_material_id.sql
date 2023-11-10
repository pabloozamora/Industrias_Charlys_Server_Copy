 /*Función para asignar el nuevo id al material*/
 CREATE OR REPLACE FUNCTION assign_material_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_material FROM 4) AS INTEGER) INTO prev_id_number FROM material ORDER BY id_material DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_material = CONCAT('MAT', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 12, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_material_id ON material; 
 CREATE TRIGGER tr_assign_material_id
 BEFORE INSERT
 ON material
 FOR EACH ROW
 EXECUTE PROCEDURE assign_material_id();