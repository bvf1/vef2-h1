/* eslint-disable no-await-in-loop */
import fs from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

import csvParser from 'csv-parser';

import { logger } from '../utils/logger.js';
import { readDir, readFile, stat } from '../utils/fs-helpers.js';
import { query, end } from '../db.js';
import { listImages, uploadImage } from '../utils/cloudinary.js';

const DATA_DIR = './../../data';
const IMG_DIR = './../../data/img';
const SQL_DIR = './../../sql';

const path = dirname(fileURLToPath(import.meta.url));

/**
 * Les inn schema fyrir gagnagrunn úr SQL skrá.
 */
async function schema() {
  const schemaFile = join(path, SQL_DIR, 'schema.sql');
  const data = await readFile(schemaFile);
  await query(data);
}

/**
 * Les inn SQL skipanir eftir að skema er tilbúið.
 */
async function postSchemaSql() {
  const schemaFile = join(path, SQL_DIR, 'post.sql');
  const data = await readFile(schemaFile);
  await query(data);
}

/**
 * Keyrir inn öll gögn í röð.
 * Mætti bæta villumeðhöndlun, en þar sem þetta er keyrt „handvirkt“ verður
 * villumeðhöndlun mannleg: ef við sjáum villu lögum við villu.
 */
async function main() {
  await schema();
  logger.info('Schema created');
  await postSchemaSql();
  logger.info('Post schema SQL run');
  await end();
}

main().catch((err) => {
  logger.error(err);
});
