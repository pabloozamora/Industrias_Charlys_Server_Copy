/* Verificar existencias de los materiales necesitados para un producto */
 CREATE OR REPLACE FUNCTION check_availability()
 RETURNS trigger as
 $BODY$
 declare row record;
 begin
 	FOR row IN (
  	SELECT * FROM get_not_enough(new.product,new.size, new.quantity)
  ) LOOP
  
  	if row.tipo = 'material' then
    	RAISE WARNING 'Advertencia: No hay suficiente cantidad del siguiente material: %.
	 	Se necesitan % % y en bodega hay %', row.element, row.required, row.measurement, row.available;
	else
		RAISE WARNING 'Advertencia: No hay suficiente cantidad de la siguiente tela: %.
		Se necesitan % % y en bodega hay %', row.element, row.required, row.measurement, row.available;
	end if;
  END LOOP;
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';
 
DROP TRIGGER IF EXISTS tr_check_availability ON order_detail; 
 CREATE TRIGGER tr_check_availability
 BEFORE INSERT
 ON order_detail
 FOR EACH ROW
 EXECUTE PROCEDURE check_availability();