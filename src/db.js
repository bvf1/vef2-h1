import dotenv from 'dotenv';
import pg from 'pg';
import xss from 'xss';

import { toPositiveNumberOrDefault } from './utils/toPositiveNumberOrDefault.js';
import { logger } from './utils/logger.js';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

/**
 * Serie.
 * @typedef {Object} Serie
 * @property {number | null} id - ID of serie, if defined
 * @property {string} name Name of serie
 * @property {Date} airDate First aired
 * @property {boolean} inProduction Serie is in production?
 * @property {string | null} tagline Tagline, if defined for serie
 * @property {string} image Path to image
 * @property {string | null} description Description of serie
 * @property {string} language ISO 639-1 language code
 * @property {string | null} network Network series is shown on
 * @property {string | null} url URL of serie if defined
 */

/**
 * Genre.
 * @typedef {Object} Genre
 * @property {number | null} id - ID of genre, if defined
 * @property {string} name Name of genre
 */

/**
 * Season.
 * @typedef {Object} Season
 * @property {number | null} id - ID of season, if defined
 * @property {number | null} serieId - ID of serie, if defined
 * @property {string} name Name of season
 * @property {string} number Number of season
 * @property {Date} airDate First aired
 * @property {string | null} overview Overview, if defined for season
 * @property {string} poster Path to poster
 */

/**
 * Episode.
 * @typedef {Object} Episode
 * @property {number | null} id - ID of episode, if defined
 * @property {number | null} serieId - ID of serie, if defined
 * @property {number | null} seasonId - ID of season, if defined
 * @property {string} name Name of episode
 * @property {string} number Number of episode
 * @property {Date} airDate First aired
 * @property {string | null} overview Overview, if defined for episode
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

// TODO refactor
export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values
    .filter((i) => typeof i === 'string'
      || typeof i === 'number'
      || i instanceof Date);

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
