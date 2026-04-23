BEGIN;

-- Remove broken UTF replacement-char rows from athletics catalogs.
DELETE FROM sport_events
WHERE sport_code = 'ATHLETICS'
  AND (
    name LIKE '%' || chr(65533) || '%'
    OR discipline_name LIKE '%' || chr(65533) || '%'
    OR COALESCE(short_name, '') LIKE '%' || chr(65533) || '%'
  );

DELETE FROM sport_disciplines
WHERE sport_code = 'ATHLETICS'
  AND name LIKE '%' || chr(65533) || '%';

COMMIT;

