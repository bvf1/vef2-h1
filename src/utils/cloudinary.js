import util from 'util';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const resourcesAsync = util.promisify(cloudinary.api.resources);
const uploadAsync = util.promisify(cloudinary.uploader.upload);

const CLOUDINARY_MAX_RESULTS = 100;

let cachedListImages = null;

export async function listImages() {
  if (cachedListImages) {
    return Promise.resolve(cachedListImages);
  }

  let nextCursor;
  const resources = [];

  do {
    const query = { max_results: CLOUDINARY_MAX_RESULTS };

    if (nextCursor) {
      query.next_cursor = nextCursor;
    }

    // eslint-disable-next-line no-await-in-loop
    const res = await resourcesAsync(query);

    nextCursor = res.next_cursor;

    resources.push(...res.resources);
  } while (nextCursor);

  cachedListImages = resources;

  return resources;
}

export async function uploadImage(filepath) {
  console.log("uploadImage filepath",filepath);
  const uploaded = await uploadAsync(filepath);
  console.log(uploaded);
  return uploaded;
}

export async function uploadToCloudinarY(imagePath) {
  let image;
  console.log("imagePath",imagePath);
  try {
    const uploadResult = await uploadImage(imagePath);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('no secure_url from cloudinary upload');
    }
    image = uploadResult.secure_url;
  } catch (e) {
    logger.error('Unable to upload file to cloudinary', e);
    return null;
  }
  return image;
}
