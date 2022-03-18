/* eslint-disable no-await-in-loop */
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

import { logger } from '../utils/logger.js';
import { readDir, readFile, stat } from '../utils/fs-helpers.js';
import { query, end } from '../db.js';
import { listImages, uploadImage } from '../utils/cloudinary.js';

const IMG_DIR = './../../data/img';
const SQL_DIR = './../../sql';

const path = dirname(fileURLToPath(import.meta.url));

/**
 * Möppun á milli skráarnafns myndar og slóðar á Cloudinary
 * <skráarnafn> => <url>
 */
const imageCloudinaryUrl = new Map();

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

async function images() {
  const imagesOnDisk = await readDir(join(path, IMG_DIR));
  const filteredImages = imagesOnDisk.filter(
    (i) => extname(i).toLowerCase() === '.jpg',
  );

  if (filteredImages.length === 0) {
    logger.warn('No images to upload');
    return;
  }

  const cloudinaryImages = await listImages();
  logger.verbose(`${cloudinaryImages.length} images in Cloudinary`);

  for (const image of filteredImages) {
    let cloudinaryUrl = '';
    const imgPath = join(path, IMG_DIR, image);
    const imgSize = (await stat(imgPath)).size;
    const uploaded = cloudinaryImages.find((i) => i.bytes === imgSize);

    if (uploaded) {
      cloudinaryUrl = uploaded.secure_url;
      logger.verbose(`${imgPath} already uploaded to Cloudinary`);
    } else {
      const upload = await uploadImage(imgPath);
      cloudinaryUrl = upload.secure_url;
      logger.verbose(`${imgPath} uploaded to Cloudinary`);
    }

    imageCloudinaryUrl.set(image, cloudinaryUrl);
  }
}

/**
 * Keyrir inn öll gögn í röð.
 * Mætti bæta villumeðhöndlun, en þar sem þetta er keyrt „handvirkt“ verður
 * villumeðhöndlun mannleg: ef við sjáum villu lögum við villu.
 */
async function main() {
  await images();
  logger.info('Images uploaded');
  await schema();
  logger.info('Schema created');
  await postSchemaSql();
  logger.info('Post schema SQL run');
  await end();
}

main().catch((err) => {
  logger.error(err);
});
