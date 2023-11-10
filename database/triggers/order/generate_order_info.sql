/*Función para obtener información del pedido aceptado*/
 CREATE OR REPLACE FUNCTION generate_order_info()
 RETURNS trigger as
 $BODY$
 declare description text;
 declare deadline date;
 declare id_client_organization text;
 begin
 	SELECT oreq.description, oreq.deadline, oreq.id_client_organization
	INTO description, deadline, id_client_organization
	FROM order_request oreq where id_order_request = NEW.id_order_request;
	
	NEW.description = description;
	NEW.deadline = deadline;
	NEW.id_client_organization = id_client_organization;
	
	IF NEW.id_client_organization is null and NEW.description is null and NEW.deadline is null then
		RAISE EXCEPTION 'La solicitud de pedido indicada no existe.'
			USING ERRCODE = '23503';
	end if;
	
	IF NEW.id_client_organization is null then
        RAISE EXCEPTION 'Primero debe crear un cliente asociado a este pedido.'
			USING ERRCODE = '42P02';
    END IF;	
	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS tr_generate_order_info ON "order"; 
 CREATE TRIGGER tr_generate_order_info
 BEFORE INSERT
 ON "order"
 FOR EACH ROW
 EXECUTE PROCEDURE generate_order_info();