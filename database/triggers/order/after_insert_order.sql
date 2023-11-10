/*Función para especificar acciones a realizar después de insertar registro en order*/
 CREATE OR REPLACE FUNCTION after_insert_order()
 RETURNS trigger as
 $BODY$
 declare row record;
 begin
 	-- Creación de order_media a partir de order_request_media
 	FOR row IN (
		select * from order_request_media where id_order_request = NEW.id_order_request
	  ) LOOP

		INSERT INTO order_media values(NEW.id_order, row.name);
  	END LOOP;
	
	-- Creación de productos a partir de product_model
 	FOR row IN (
		select distinct id_product_model, "type", id_client_organization, "name", details
			from order_request_requirement natural join product_model 
			where id_order_request = NEW.id_order_request
	  ) LOOP
		INSERT INTO product(id_product, id_product_model, "type", id_client_organization, "name", details)
			values(default, row.id_product_model, row."type", row.id_client_organization, row."name", row.details);
  	END LOOP;
	
	-- Creación de order_detail a partir de order_request_requirement
	FOR row IN (
		select id_order_request, p.id_product_model, "size", quantity, id_product, unit_cost
			from order_request_requirement natural join product p
			where id_order_request = NEW.id_order_request
	  ) LOOP
		INSERT INTO order_detail values(NEW.id_order, row.id_product, row."size", row.quantity, row.unit_cost);
  	END LOOP;
	
	-- Eliminación de registros relacionados a order_request
	DELETE FROM order_request_media where id_order_request = NEW.id_order_request;
	DELETE FROM order_request_requirement where id_order_request = NEW.id_order_request;
	DELETE FROM order_request where id_order_request = NEW.id_order_request;
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_after_insert_order ON "order"; 
 CREATE TRIGGER tr_after_insert_order
 AFTER INSERT
 ON "order"
 FOR EACH ROW
 EXECUTE PROCEDURE after_insert_order();