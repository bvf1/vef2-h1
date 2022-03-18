// eslint-disable-next-line import/no-extraneous-dependencies
import pkg from '@faker-js/faker';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { insertCategory, insertProduct } from '../db.js';
import { logger } from '../utils/logger.js';
import { PlaceImg } from './placeimg.js';
import { uploadToCloudinarY } from '../utils/cloudinary.js';
import { insertOrder } from '../api/orders.js';

const { faker } = pkg;

const CACHE_DIR = './../../.cache';
const IMAGE_DIR = './../../data/img';

const path = dirname(fileURLToPath(import.meta.url));
const resolvedCacheDir = join(path, CACHE_DIR);
const resolvedImageDir = join(path, IMAGE_DIR);

const { PI_TOKEN: piToken } = process.env;

if (!piToken) {
  logger.error('Missing PI_TOKEN from env');
  process.exit(-1);
}

let placeImg;

try {
  placeImg = new PlaceImg({
    cacheDir: resolvedCacheDir,
    imageDir: resolvedImageDir,
    logger,
    token: piToken,
  });
} catch (e) {
  logger.error('Unable to create placemg instance', e);
}

function getImageFromFaker() {
  // const string = `${faker.image.food()}?random=${Math.round(Math.random() * 1000)}`;
  const string = `${faker.image.food()}random${Math.round(Math.random() * 1000)}`;
  return string;
}

export function getImagesFromFaker(n) {
  const images = [];
  for (let index = 0; index < n; index += 1) {
    const result = getImageFromFaker();
    images.push(result);
  }

  return images;
}

async function getImage() {
  const imageFromFaker = await getImageFromFaker();

  const imageFromPlaceImg = await placeImg.fetchImage(imageFromFaker);

  const filepath = `data/img/${imageFromPlaceImg.filename}`;

  const result = await uploadToCloudinarY(filepath);
  return result;
}

// catagories and products

const catagoriesNumber = 5;
const productNumber = 3;

// fake categories
const categories = [];
let category;
for (let i = 0; i < catagoriesNumber; i += 1) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    category = faker.commerce.department();
    if (!categories.includes(category)) break;
  }
  categories.push(category);
}

// fake product
const products = [];
let product;
for (let j = 0; j < catagoriesNumber; j += 1) {
  for (let i = 0; i < productNumber; i += 1) {
    while (true) {
      product = faker.commerce.product();
      if (!products.includes(product)) break;
    }
    products.push(product);
  }
}

async function insertIntoProduct(index, cat) {
  const result = await cat;

  if (result === null) return;
  const { id } = await cat;
  const price = parseInt(faker.commerce.price(), 10);
  const image = await getImage();
  await insertProduct({
    title: products[index],
    price,
    description: faker.commerce.productDescription(),
    image,
    category: id,
  });
}

async function insertIntoCategory(i) {
  const title = categories[i];
  const result = await insertCategory({ title });
  return result;
}

let cd = 0;
for (let i = 0; i < catagoriesNumber; i += 1) {
  const result = insertIntoCategory(i);
  for (let j = 0; j < productNumber; j += 1) {
    insertIntoProduct(cd, result);
    cd += 1;
  }
}

for (let index = 0; index < 2; index++) {
  const noun = faker.hacker.noun();
  console.log(noun);
  insertOrder({ name: noun });
}
