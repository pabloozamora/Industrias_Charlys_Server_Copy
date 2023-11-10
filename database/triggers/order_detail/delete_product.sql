/*Función para especificar acciones a realizar después de insertar registro en order*/
 CREATE OR REPLACE FUNCTION delete_product()
 RETURNS trigger as
 $BODY$
 begin
 	-- Eliminar producto si existe
	IF (OLD.id_product in (select id_product from product)) THEN
		DELETE FROM product where id_product = OLD.id_product;
	END IF;
	RETURN OLD;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_delete_product ON order_detail; 
 CREATE TRIGGER tr_delete_product
 AFTER DELETE
 ON order_detail
 FOR EACH ROW
 EXECUTE PROCEDURE delete_product();