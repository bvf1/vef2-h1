/* eslint-disable no-await-in-loop */
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

import { prepareDir } from '../utils/fs-helpers.js';
import { logger } from '../utils/logger.js'
import { PlaceImg } from './placeimg.js';
import { getImagesFromFaker } from './faker.js';

dotenv.config();

const CACHE_DIR = './../../.cache';
const DATA_DIR = './../../data';
const IMAGE_DIR = './../../data/img';

const path = dirname(fileURLToPath(import.meta.url));
const resolvedCacheDir = join(path, CACHE_DIR);
const resolvedImageDir = join(path, IMAGE_DIR);
const resolvedDataDir = join(path, DATA_DIR);

const { TMDB_TOKEN: tmdbToken } = process.env;

if (!tmdbToken) {
  logger.error('Missing TMDB_TOKEN from env');
  process.exit(-1);
}

/**
 * Sækir 20 vinsælustu sjónvarpsþættina á themoviedatabase, sækir síðan öll
 * season fyrir hvern, og að lokum alla þætti í hverju season. Að lokum er allt
 * vistað í CSV skrár.
 * Fyrir myndir, þá er myndin vistuð jafnóðum í myndamöppu og vísað í heiti
 * hennar í gögnum.
 */
async function main() {
  const cacheDirResult = await prepareDir(resolvedCacheDir);
  const imageDirResult = await prepareDir(resolvedImageDir);
  const dataDirResult = await prepareDir(resolvedDataDir);

  if (!cacheDirResult) {
    logger.error(`Dir "${resolvedCacheDir}" is not writeable`);
  }

  if (!imageDirResult) {
    logger.error(`Dir "${resolvedImageDir}" is not writeable`);
  }

  if (!cacheDirResult || !imageDirResult || !dataDirResult) {
    process.exit(-1);
  }

  let placeImg;
  try {
    placeImg = new PlaceImg({
      cacheDir: resolvedCacheDir,
      imageDir: resolvedImageDir,
      logger,
      token: tmdbToken,
    });
  } catch (e) {
    logger.error('Unable to create placemg instance', e);
  }

  const numberOfImages = 20;
  const images = getImagesFromFaker(numberOfImages);
  for (let i = 0; i < numberOfImages; i++) {
    conole.log(await placeImg.fetchImage(images[i]));
  }
}

main().catch((e) => logger.error(e));
