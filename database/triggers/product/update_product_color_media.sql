/*Función para obtener colores y media de producto a partir de product_model*/
 CREATE OR REPLACE FUNCTION update_product_color_media()
 RETURNS trigger as
 $BODY$
 declare row record;
 begin
 	IF NEW.id_product_model is null then
		RETURN NEW;
	END IF;
 
 	FOR row IN (
		select * from product_model_color where id_product_model = NEW.id_product_model
	  ) LOOP
		INSERT INTO product_color values(NEW.id_product, row.id_color);
  	END LOOP;
	
	FOR row IN (
		select * from product_model_media where id_product_model = NEW.id_product_model
	  ) LOOP
		INSERT INTO product_media values(NEW.id_product, row.name);
  	END LOOP;
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_update_product_color_media ON product; 
 CREATE TRIGGER tr_update_product_color_media
 AFTER INSERT
 ON product
 FOR EACH ROW
 EXECUTE PROCEDURE update_product_color_media();