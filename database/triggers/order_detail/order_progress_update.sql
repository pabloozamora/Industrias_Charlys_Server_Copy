/* Agregar registro en progreso de orden */
 CREATE OR REPLACE FUNCTION order_progress_update()
 RETURNS trigger as
 $BODY$
 begin
 	INSERT INTO order_progress VALUES (new.id_order, new.id_product, new.size, now(),
									   CONCAT(TG_OP, ': Se han completado ', COALESCE(new.quantity_completed, 0), ' unidades.'));
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';
 
DROP TRIGGER IF EXISTS tr_order_progress_update ON order_detail; 
 CREATE TRIGGER tr_order_progress_update
 AFTER UPDATE or INSERT
 ON order_detail
 FOR EACH ROW
 EXECUTE PROCEDURE order_progress_update();