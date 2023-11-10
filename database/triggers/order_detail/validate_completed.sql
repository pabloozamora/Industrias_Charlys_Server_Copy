/* Verificar que la cantidad completada no supera la cantidad requerida */
 CREATE OR REPLACE FUNCTION validate_completed()
 RETURNS trigger as
 $BODY$
 begin
 	if (new.quantity_completed > new.quantity) then
    	RAISE exception 'La cantidad de unidades completadas supera la cantidad de unidades requeridas.';
	end if;
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';
 
DROP TRIGGER IF EXISTS tr_validate_completed ON order_detail; 
 CREATE TRIGGER tr_validate_completed
 BEFORE UPDATE or INSERT
 ON order_detail
 FOR EACH ROW
 EXECUTE PROCEDURE validate_completed();