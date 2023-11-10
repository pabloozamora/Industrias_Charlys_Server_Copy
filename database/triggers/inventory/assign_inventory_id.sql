/*Función para asignar el nuevo id al elemento en bodega*/
 CREATE OR REPLACE FUNCTION assign_inventory_id()
 RETURNS trigger as
 $BODY$
 declare prev_id_number integer;
 begin
 	SELECT CAST(SUBSTRING(id_inventory FROM 4) AS INTEGER) INTO prev_id_number FROM inventory ORDER BY id_inventory DESC LIMIT 1;
	IF (prev_id_number IS NULL) THEN
		prev_id_number = 0;
		END IF;
	NEW.id_inventory = CONCAT('INV', LPAD(CAST(prev_id_number + 1 AS VARCHAR), 12, '0'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_assign_inventory_id ON inventory; 
 CREATE TRIGGER tr_assign_inventory_id
 BEFORE INSERT
 ON inventory
 FOR EACH ROW
 EXECUTE PROCEDURE assign_inventory_id();