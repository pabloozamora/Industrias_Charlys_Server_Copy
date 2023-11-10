 CREATE OR REPLACE FUNCTION verify_product_model_ownership()
 RETURNS trigger as
 $BODY$
 declare idClientOrg1 VARCHAR(15);
 declare idClientOrg2 VARCHAR(15);
 begin
 	SELECT id_client_organization INTO idClientOrg1 FROM order_request WHERE id_order_request = NEW.id_order_request;
	SELECT id_client_organization INTO idClientOrg2 FROM product_model WHERE id_product_model = NEW.id_product_model;
	
	IF (idClientOrg1 <> idClientOrg2) THEN
		RAISE EXCEPTION 'El modelo de producto no pertenece a la organización.'
		using ERRCODE = '23514',
			DETAIL = 'El campo (id_product_model) no pertenece a la organización (id_client_organization).';
		END IF;

	RETURN NEW;
 END;
 $BODY$
 LANGUAGE 'plpgsql';

 DROP TRIGGER IF EXISTS verify_product_model_ownership ON order_request_requirement; 
 CREATE TRIGGER tr_verify_product_model_ownership
 BEFORE INSERT
 ON order_request_requirement
 FOR EACH ROW
 EXECUTE PROCEDURE verify_product_model_ownership();