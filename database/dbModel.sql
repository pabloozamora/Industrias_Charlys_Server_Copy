drop table if exists order_request, order_request_media, user_account, client_organization, employee,
"session", order_request, "order", order_detail, inventory, requirements, product, product_type, 
"size", material, fabric CASCADE;

CREATE TABLE user_account(
	id_user VARCHAR(15) PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	lastname VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	phone VARCHAR(15),
	password TEXT,
	sex CHAR NOT NULL,
	id_client_organization VARCHAR(15),
	id_employee VARCHAR(15),
	UNIQUE(id_client_organization, id_employee),
	enabled BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE client_organization(
	id_client_organization VARCHAR(15) PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100),
	phone VARCHAR(100),
	address VARCHAR(300) NOT NULL,
	enabled BOOLEAN DEFAULT true NOT NULL
);

CREATE TABLE employee(
	id_employee VARCHAR(15) PRIMARY KEY,
	role varchar(15) NOT NULL
);

CREATE TABLE session(
	id_user VARCHAR(15) NOT NULL,
	token TEXT NOT NULL,
	"type" VARCHAR(20) NOT NULL;
);

create table "order"(
	id_order varchar(15) primary key,
	id_order_request VARCHAR(15),
	deadline date,
	description text,
	id_client_organization VARCHAR(15),
	production_phase INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "size"(
	"size" VARCHAR(10) PRIMARY KEY,
	"sequence" SMALLINT UNIQUE
);

CREATE TABLE product_type(
	id_product_type VARCHAR(15) PRIMARY KEY,
	"name" VARCHAR(100)
);

CREATE TABLE product(
	id_product VARCHAR(15) PRIMARY KEY,
	id_product_model VARCHAR(15),
	"type" VARCHAR(15) NOT NULL,
	id_client_organization VARCHAR(15) NOT NULL,
	"name" VARCHAR(200) NOT NULL,
	details TEXT,
);

CREATE TABLE order_detail(
	id_order VARCHAR(15),
	id_product VARCHAR(15),
	"size" VARCHAR(10),
	quantity INT,
	unit_cost FLOAT,
	quantity_completed INT,
	PRIMARY KEY(id_order, id_product, "size")
);

CREATE TABLE order_progress(
	id_order VARCHAR(15) NOT NULL,
	id_product VARCHAR(15) NOT NULL,
	"size" VARCHAR(10) NOT NULL,
	date DATE NOT NULL,
	description VARCHAR(50) NOT NULL
)

	CREATE TABLE material(
		id_material VARCHAR(15) PRIMARY KEY,
		name VARCHAR(200) NOT NULL,
		supplier VARCHAR(100),
		color VARCHAR(100),
		type INTEGER NOT NULL
	);

	CREATE TABLE material_type(
		id_material_type SERIAL PRIMARY KEY,
		name VARCHAR(200) NOT NULL
	);


CREATE TABLE inventory(
	id_inventory VARCHAR(15) PRIMARY KEY,
	material VARCHAR(15) UNIQUE,
	product INTEGER UNIQUE,
	quantity FLOAT NOT NULL DEFAULT 0,
	measurement_unit VARCHAR(100) NOT NULL,
	details VARCHAR(500)
);


CREATE TABLE product_in_inventory(
	id SERIAL PRIMARY KEY,
	id_product VARCHAR(15) NOT NULL,
	"size" VARCHAR(10) NOT NULL
);

CREATE TABLE requirements(
	product VARCHAR(15),
	"size" VARCHAR(10),
	material VARCHAR(15),
	fabric VARCHAR(15),
	quantity_per_unit FLOAT
);

CREATE TABLE temporary_client(
	id_temporary_client VARCHAR(15) primary key,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL,
	phone VARCHAR(15),
	address VARCHAR(200) NOT NULL
);

create table order_request(
	id_order_request varchar(15) primary key,
	description text,
	date_placed date,
	id_client_organization VARCHAR(15),
	id_temporary_client VARCHAR(15),
	deadline DATE,
	aditional_details TEXT
);

CREATE TABLE order_request_media(
  id_order_request varchar(15) NOT NULL,
  name varchar(1000) NOT NULL
);

CREATE TABLE order_media(
  id_order varchar(15) NOT NULL,
  name varchar(1000) NOT NULL
);

CREATE TABLE alter_user_token(
	id_user VARCHAR(15) NOT NULL,
	token TEXT NOT NULL
);

CREATE TABLE color(
	id_color VARCHAR(15) PRIMARY KEY,
	"name" VARCHAR(100)	NOT NULL,
	red SMALLINT NOT NULL,
	green SMALLINT NOT NULL,
	blue SMALLINT NOT NULL
);

CREATE TABLE product_model(
	id_product_model VARCHAR(15) PRIMARY KEY,
	"type" VARCHAR(15) NOT NULL,
	id_client_organization VARCHAR(15) NOT NULL,
	name VARCHAR(200) NOT NULL,
	details TEXT
);

CREATE TABLE product_model_color(
	id_product_model VARCHAR(15) NOT NULL,
	id_color VARCHAR(15) NOT NULL,
	UNIQUE(id_product_model, id_color)
);

CREATE TABLE product_model_media(
  id_product_model varchar(15) NOT NULL,
  name varchar(1000) NOT NULL
);

CREATE TABLE order_request_requirement(
	id_order_request VARCHAR(15) NOT NULL,
	id_product_model VARCHAR(15) NOT NULL,
	"size" VARCHAR(10) NOT NULL,
	quantity INTEGER NOT NULL,
	unit_cost FLOAT,
	UNIQUE(id_order_request, id_product_model, "size")
);

CREATE TABLE product_color(
	id_product VARCHAR(15) NOT NULL,
	id_color VARCHAR(15) NOT NULL,
	UNIQUE(id_product, id_color)
);

CREATE TABLE product_media(
  id_product varchar(15) NOT NULL,
  name varchar(1000) NOT NULL
);