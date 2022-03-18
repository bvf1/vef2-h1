import dotenv from 'dotenv';
import pg from 'pg';
import xss from 'xss';

import { toPositiveNumberOrDefault } from './utils/toPositiveNumberOrDefault.js';
import { logger } from './utils/logger.js';

dotenv.config();

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } = process.env;

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

/**
 * Catagory.
 * @typedef {Object} Catagory
 * @property {number} id -ID of product
 * @property {String} title name of product
 */

/**
 * Product.
 * @typedef {Object} Product
 * @property {number | null} id -ID of product, if defined
 * @property {String} title name of product
 * @property {integer} price price of product
 * @property {String} description description of product
 * @property {String} image path to image
 * @property {number} category id from category
 * @property {Date} created date product was added
 * @property {Date} updated date product was updated
 */

export async function query(_query, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(_query, values);
    return result;
  } finally {
    client.release();
  }
}

export async function singleQuery(_query, values = []) {
  const result = await query(_query, values);

  if (result.rows && result.rows.length === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteQuery(_query, values = []) {
  const result = await query(_query, values);

  return result.rowCount;
}

export async function pagedQuery(
  sqlQuery,
  values = [],
  { offset = 0, limit = 10 } = {},
) {
  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);

  return {
    limit: limitAsNumber,
    offset: offsetAsNumber,
    items: result.rows,
  };
}

export async function end() {
  await pool.end();
}

/**
 * Insert a state change
 */
export async function insertStateChange({
  orderid, newstate,
}) {
  const q = `
    INSERT INTO statechanges
    (orderid, newstate)
    VALUES ($1, $2)
    RETURNING *`;
  const values = [orderid, xss(newstate)];
  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting state change', e);
  }

  return null;
}

/**
 * Insert a category
 * @param {Category} category Category to create
 * @returns {Category} Category created, with ID
 */
export async function insertCategory({
  title,
}) {
  const q = `
    INSERT INTO categories
    (title)
    VALUES ($1)
    RETURNING *`;
  const values = [xss(title)];
  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting category', e);
  }

  return null;
}

export async function deleteCategory({ id }) {
  const q = `
    DELETE FROM
      categories
    WHERE
      "id" = $1
  `;
  const values = [id];

  try {
    const deletionRowCount = await deleteQuery(q, values);

    if (deletionRowCount === 0) {
      return id;
    }
    return null;
  } catch (e) {
    logger.error(
      `unable to delete category ${id}`,
      e,
    );
  }
  return id;
}

export async function listCategoryNames() {
  const q = `
    SELECT
      title
    FROM
      categories
  `;
  try {
    const result = await query(q);
    return result.rows;
  } catch (e) {
    logger.error('Error getting categories', e);
  }

  return null;
}

export async function listCategoryById({ id }) {
  const category = await singleQuery(
    `
      SELECT
        *
      FROM
        categories
      WHERE
        id = $1
    `,
    [id],
  );

  if (!category) {
    return null;
  }

  return category;
}

export async function updateCategory({ title, id }) {
  const category = await singleQuery(
    `
    UPDATE categories
      SET title = $1
    WHERE
      "id" = $2
    RETURNING
      *
    `,
    [xss(title), id],
  );

  if (!category) {
    return null;
  }

  return category;
}

export async function listCategoryByTitle({ title }) {
  const category = await singleQuery(
    `
      SELECT
        *
      FROM
        categories
      WHERE
        title = $1
    `,
    [title],
  );

  if (!category) {
    return null;
  }

  return category;
}

/**
 * Insert a product
 * @param {Product} product Product to create
 * @returns {Product} Product created, with ID
 */
export async function insertProduct({
  title,
  price,
  description,
  image = '',
  category,
}) {
  const q = `
    INSERT INTO
      products
      (title, price, description, image, category, created, updated)
    VALUES
      ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING
      *
    `;
  const values = [xss(title), price, xss(description), xss(image), category];
  try {
    const result = await query(q, values);
    return result.rows[0];
  } catch (e) {
    logger.error('Error inserting product', e);
  }

  return null;
}

export async function deleteProduct({ id }) {
  const q = `
    DELETE FROM
      products
    WHERE
      "id" = $1
  `;
  const values = [id];

  try {
    const deletionRowCount = await deleteQuery(q, values);

    if (deletionRowCount === 0) {
      return id;
    }
    return null;
  } catch (e) {
    logger.error(
      `unable to delete product ${id}`,
      e,
    );
  }
  return id;
}

export async function listProduct(req) {
  const id = req;
  const q = `
    SELECT
      *
    FROM
      products
    WHERE
      id = $1
  `;
  const values = [xss(id)];

  try {
    const result = await singleQuery(q, values);

    return result;
  } catch (e) {
    logger.error('Error getting product', e);
  }

  return null;
}

export async function listProductById(req) {
  const id = req;
  const q = `
    SELECT
      *
    FROM
      products
    WHERE
      id = $1
  `;
  const values = [xss(id)];

  try {
    const result = await singleQuery(q, values);

    return result;
  } catch (e) {
    logger.error('Error getting product', e);
  }

  return null;
}

export async function listProductNames({ title }) {
  const q = `
    SELECT
      title
    FROM
      products
    WHERE
      title = $1
  `;
  const values = [xss(title)];
  try {
    const result = await query(q, values);
    return result.rows;
  } catch (e) {
    logger.error('Error getting product names', e);
  }

  return null;
}

export async function listProductsByCategory({ title }) {
  const q = `
    SELECT
      title
    FROM
      products
    WHERE
      title = $1
  `;

  const values = [xss(title)];
  try {
    const result = await query(q, values);
    return result.rows;
  } catch (e) {
    logger.error('Error getting product names', e);
  }

  return null;
}

// TODO refactor
export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i) => typeof i === 'string' || typeof i === 'number' || i instanceof Date,
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);

  console.info('Conditional update', q, queryValues);

  const result = await query(q, queryValues);

  return result;
}
