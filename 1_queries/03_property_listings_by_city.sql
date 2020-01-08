SELECT p.*, avg(pr.rating) as average_rating
FROM properties p
INNER JOIN property_reviews pr ON p.id = pr.property_id
WHERE p.city LIKE '%ancouv%'
GROUP BY p.id
HAVING avg(pr.rating) >= 4
ORDER BY p.cost_per_night
LIMIT 10;