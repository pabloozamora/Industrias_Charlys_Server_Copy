/*Función para asignar el nuevo id al producto*/
 CREATE OR REPLACE FUNCTION assign_product_model_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_product_model FROM 3) AS INTEGER) INTO prev_id_number FROM product_model ORDER BY id_product_model DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_product_model = CONCAT('PM', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 13, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_product_model_id ON product_model; 
 CREATE TRIGGER tr_assign_product_model_id
 BEFORE INSERT
 ON product_model
 FOR EACH ROW
 EXECUTE PROCEDURE assign_product_model_id();