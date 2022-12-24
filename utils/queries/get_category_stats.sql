SELECT sum(1) FILTER (
                      WHERE "Categories".type = 'setting') AS settings_count,
       sum(1) FILTER (
                      WHERE "Categories".type = 'character') AS character_count,
       sum(1) FILTER (
                      WHERE "Categories".type = 'format') AS format_count
FROM "Categories"
LIMIT 1