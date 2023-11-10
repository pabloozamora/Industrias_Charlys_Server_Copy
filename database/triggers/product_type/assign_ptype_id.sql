 /*Función para asignar el nuevo id al tipo de producto*/
 CREATE OR REPLACE FUNCTION assign_ptype_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_product_type FROM 3) AS INTEGER) INTO prev_id_number FROM product_type ORDER BY id_product_type DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_product_type = CONCAT('PT', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 13, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_ptype_id ON product_type; 
 CREATE TRIGGER tr_assign_ptype_id
 BEFORE INSERT
 ON product_type
 FOR EACH ROW
 EXECUTE PROCEDURE assign_ptype_id();