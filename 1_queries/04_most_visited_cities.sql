SELECT p.city, count(r.id) AS total_reservations FROM properties p
INNER JOIN reservations r ON p.id = r.property_id
GROUP BY p.city
ORDER BY total_reservations DESC;