/*Función para asignar el nuevo id al producto*/
 CREATE OR REPLACE FUNCTION assign_product_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_product FROM 2) AS INTEGER) INTO prev_id_number FROM product ORDER BY id_product DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_product = CONCAT('P', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 14, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_product_id ON product; 
 CREATE TRIGGER tr_assign_product_id
 BEFORE INSERT
 ON product
 FOR EACH ROW
 EXECUTE PROCEDURE assign_product_id();