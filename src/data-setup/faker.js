// eslint-disable-next-line import/no-extraneous-dependencies
import pkg from '@faker-js/faker';
import { insertCategory, insertProduct } from '../db.js';

const { faker, commerce } = pkg;

const catagoriesNumber = 5;
const productNumber = 3;
// fake categories
const categories = [];
let category;
for (let i = 0; i < catagoriesNumber; i += 1) {
  while (true) {
    category = faker.commerce.department();
    if (!categories.includes(category)) break;
  }
  categories.push(category);
}

// fake product
const products = [];
let product;
for (let j = 0; j < catagoriesNumber; j++) {
  for (let i = 0; i < productNumber; i += 1) {
    while (true) {
      product = faker.commerce.product();
      if (!products.includes(product)) break;
    }
    products.push(product);
  }
}

async function insertIntoProduct(index, cat) {
  const { id } = await cat;
  const price = parseInt(faker.commerce.price(), 10);
  await insertProduct({
    title: products[index],
    price,
    description: faker.commerce.productDescription(),
    image: faker.image.imageUrl(),
    category: id,
  });
}

async function insertIntoCategory(i) {
  const title = categories[i];
  const result = await insertCategory({ title });
  return result;
}

for (let i = 0; i < catagoriesNumber; i++) {
  const result = insertIntoCategory(i);
  for (let j = 0; j < productNumber; j++) {
    insertIntoProduct(j, result);
  }
}
