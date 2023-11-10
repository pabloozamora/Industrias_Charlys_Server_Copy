ALTER TABLE user_account 
ADD CONSTRAINT user_corg_fk FOREIGN KEY (id_client_organization) REFERENCES client_organization(id_client_organization),
ADD CONSTRAINT user_employee_fk FOREIGN KEY (id_employee) REFERENCES employee(id_employee),
ADD CONSTRAINT check_email CHECK (email ~ '^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$'),
ADD CONSTRAINT check_sex CHECK (sex = 'M' OR sex = 'F'),
ADD CONSTRAINT check_role CHECK ((id_client_organization IS NULL AND id_employee IS NOT NULL) OR (id_client_organization IS NOT NULL AND id_employee IS NULL));

ALTER TABLE client_organization
ADD CONSTRAINT corg_check_email CHECK (email ~ '^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$');

ALTER TABLE employee
ADD CONSTRAINT employee_check_role CHECK (role IN ('ADMIN', 'PRODUCTION', 'SALES'));

ALTER TABLE "session"
ADD CONSTRAINT session_user_fk FOREIGN KEY (id_user) REFERENCES user_account(id_user);

ALTER TABLE "order"
ADD CONSTRAINT order_client_fk FOREIGN KEY (id_client_organization) REFERENCES client_organization(id_client_organization);

ALTER TABLE "order_detail" 
ADD CONSTRAINT od_order_fk FOREIGN KEY (id_order) REFERENCES "order"(id_order) ON DELETE CASCADE,
ADD CONSTRAINT od_product_fk FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE,
ADD CONSTRAINT od_size_fk FOREIGN KEY ("size") REFERENCES "size"("size"),
ADD CONSTRAINT od_quantity_completed_check CHECK (quantity_completed <= quantity);

ALTER TABLE material
ADD CONSTRAINT material_type_fk FOREIGN KEY (type) REFERENCES material_type(id_material_type);

ALTER TABLE inventory 
ADD CONSTRAINT inventory_material_fk FOREIGN KEY (material) REFERENCES material(id_material),
ADD CONSTRAINT inventory_product_fk FOREIGN KEY (product) REFERENCES product_in_inventory(id),
ADD CONSTRAINT check_element CHECK (
	(material IS NULL AND product IS NOT NULL)
	OR (material IS NOT NULL AND product IS NULL)
);

ALTER TABLE requirements
ADD CONSTRAINT requirement_material_fk FOREIGN KEY (material) REFERENCES material(id_material),
ADD CONSTRAINT requirement_product_fk FOREIGN KEY (product) REFERENCES product(id_product),
ADD CONSTRAINT requirement_size_fk FOREIGN KEY ("size") REFERENCES "size"("size"),
ADD CONSTRAINT requirement_unique_material UNIQUE(product, "size", material),
ADD CONSTRAINT requirement_unique_fabric UNIQUE(product, "size", fabric),
ADD CONSTRAINT check_requirement CHECK (
	(material IS NULL AND fabric IS NOT NULL)
	OR (material IS NOT NULL AND fabric IS NULL AND FLOOR(quantity_per_unit) = quantity_per_unit)
);

ALTER TABLE product
ADD CONSTRAINT product_ptype_fk FOREIGN KEY ("type") REFERENCES product_type(id_product_type),
ADD CONSTRAINT product_client_fk FOREIGN KEY (client) REFERENCES client_organization(id_client_organization);

ALTER TABLE order_request
ADD CONSTRAINT client_organization_fk FOREIGN KEY (id_client_organization) REFERENCES client_organization(id_client_organization),
ADD CONSTRAINT temporary_client_fk FOREIGN KEY (id_temporary_client) REFERENCES temporary_client(id_temporary_client),
ADD CONSTRAINT client_or_temporary_check CHECK ((id_client_organization IS NULL AND id_temporary_client IS NOT NULL) 
	OR (id_client_organization IS NOT NULL AND id_temporary_client IS NULL) 
	OR (id_client_organization IS NULL AND id_temporary_client IS NULL));

ALTER TABLE order_request_media
ADD CONSTRAINT ord_req_media_fk FOREIGN KEY (id_order_request)
	REFERENCES order_request(id_order_request) ON DELETE CASCADE;

ALTER TABLE order_media
ADD CONSTRAINT ord_media_fk FOREIGN KEY (id_order) REFERENCES "order"(id_order) ON DELETE CASCADE;

ALTER TABLE temporary_client 
ADD CONSTRAINT temp_client_check_email CHECK (email ~ '^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$');

ALTER TABLE alter_user_token
ADD CONSTRAINT alterUserTkn_user_fk FOREIGN KEY (id_user) REFERENCES user_account(id_user);

ALTER TABLE color
ADD CONSTRAINT color_values_check CHECK(red >= 0 AND red <= 255 AND green >= 0 AND green <= 255 AND blue >= 0 AND blue <= 255),
ADD CONSTRAINT color_unique_name UNIQUE("name");

ALTER TABLE product_model_color
ADD CONSTRAINT pm_product_model_fk FOREIGN KEY (id_product_model) REFERENCES product_model(id_product_model),
ADD CONSTRAINT pm_color_fk FOREIGN KEY (id_color) REFERENCES color(id_color);

ALTER TABLE product_model_media
ADD CONSTRAINT pm_media_fk FOREIGN KEY (id_product_model) REFERENCES product_model(id_product_model);

ALTER TABLE product_model
ADD CONSTRAINT product_model_type_fk FOREIGN KEY ("type") REFERENCES product_type(id_product_type),
ADD CONSTRAINT product_model_client_fk FOREIGN KEY (id_client_organization) REFERENCES client_organization(id_client_organization);

ALTER TABLE order_request_requirement
ADD CONSTRAINT orr_min_quantity_check CHECK (quantity > 0),
ADD CONSTRAINT orr_order_request_fk FOREIGN KEY (id_order_request)
	REFERENCES order_request (id_order_request) ON DELETE CASCADE,
ADD CONSTRAINT orr_product_model_fk FOREIGN KEY (id_product_model) REFERENCES product_model (id_product_model),
ADD CONSTRAINT orr_size_fk FOREIGN KEY ("size") REFERENCES "size"("size");

ALTER TABLE product_color
ADD CONSTRAINT p_product_fk FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE,
ADD CONSTRAINT p_color_fk FOREIGN KEY (id_color) REFERENCES color(id_color);

ALTER TABLE product_media
ADD CONSTRAINT p_media_fk FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE;

ALTER TABLE order_progress
ADD CONSTRAINT p_progress_fk FOREIGN KEY (id_product) REFERENCES product(id_product) ON DELETE CASCADE,
ADD CONSTRAINT o_progress_fk FOREIGN KEY (id_order) REFERENCES "order"(id_order) ON DELETE CASCADE;

ALTER TABLE "order"
ADD COLUMN is_finished BOOLEAN DEFAULT false;

ALTER TABLE product_in_inventory 
ADD CONSTRAINT pinv_unique UNIQUE (id_product, "size")
ADD CONSTRAINT pinv_product_fk FOREIGN KEY (id_product) REFERENCES product(id_product);

ALTER TABLE "size"
	DROP COLUMN "sequence",
	ADD COLUMN "sequence" smallint UNIQUE;

DROP SEQUENCE "size_sequence";
CREATE SEQUENCE "size_sequence"
	MINVALUE 0
	CACHE 10;

UPDATE "size" set "sequence" = nextval('size_sequence');