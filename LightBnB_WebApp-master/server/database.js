const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // return Promise.resolve(user);

  let queryString = `SELECT * FROM users 
  WHERE email = $1`;

  return pool.query(queryString, [email])
  .then((result) => {
    // console.log(result.rows[0]);
    // return result.rows[0];
    return result ? result.rows[0] : null;
    // return (result.row[0] ? result.row[0] : null);
    // if (result.rows[0]) {
    //   return result.row[0];
    // } else {
    //   return null;
    // }
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);

  let queryString = `SELECT * FROM users 
  WHERE id = $1`;

  return pool.query(queryString, [id])
  .then((result) => {
    // return result.rows[0];
    return result ? result.rows[0] : null;
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
  // console.log(user);
  let queryString = `
  INSERT INTO users (name, email, password) 
  VALUES ($1, $2, $3)
  RETURNING *;`;

  return pool.query(queryString, [user.name, user.email, user.password])
  .then((result) => {
    console.log(result.rows[0]);
    // console.log([user.name, user.email, user.password]);
    // return result.rows[0].id;
    return {id: result.rows[0].id, name: result.rows[0].name, email: result.rows[0].email, password: result.rows[0].password}; 
  });

}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);

  const queryString = `
  SELECT properties.*, reservations.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id 
  WHERE reservations.guest_id = $1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`;

  return pool.query(queryString, [guest_id, limit])
  .then((result) => {
    return result.rows;
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
  SELECT p.*, avg(pr.rating) as average_rating
  FROM properties p
  INNER JOIN property_reviews pr ON p.id = pr.property_id
  WHERE true `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString = queryString + `AND p.city LIKE $${queryParams.length} `;
  } 

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString = queryString + `AND p.owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night));
    queryString = queryString + `AND p.cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(Number(options.maximum_price_per_night));
    queryString = queryString + `AND p.cost_per_night <= $${queryParams.length} `;
  }

  queryString += `GROUP BY p.id `;

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString = queryString + `HAVING avg(pr.rating) >= $${queryParams.length} ORDER BY p.cost_per_night `;
  }

  queryParams.push(limit);
  queryString = queryString + `
  LIMIT $${queryParams.length}
  `;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
  .then((result) => {
    return result.rows;
  })
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
