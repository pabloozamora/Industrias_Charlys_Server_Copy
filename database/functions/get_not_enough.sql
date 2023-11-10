DROP FUNCTION IF EXISTS get_not_enough(pr VARCHAR(100), sz VARCHAR(100), q FLOAT);
CREATE OR REPLACE FUNCTION get_not_enough(pr VARCHAR(100), sz VARCHAR(100), q FLOAT)
RETURNS TABLE(element VARCHAR(100), available FLOAT, required FLOAT, measurement VARCHAR(100), tipo TEXT) as
$BODY$
begin
   	return query
   	select coalesce(m.description, CONCAT(f.fabric, ' ', f.color)) as "element", quantity as available,
		quantity_per_unit * q as required, inv.measurement_unit,
		CASE WHEN m.description is not null THEN 'material'
			ELSE 'tela' END tipo
		from inventory inv inner join requirements req on inv.fabric = req.fabric
		or inv.material = req.material
		left join fabric f on f.id_fabric = inv.fabric
		left join material m on m.id_material = inv.material
		where req.product = pr and req."size" = sz
		and quantity < (quantity_per_unit * q);
end;
$BODY$
LANGUAGE plpgsql;