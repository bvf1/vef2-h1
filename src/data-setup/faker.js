// eslint-disable-next-line import/no-extraneous-dependencies
import pkg from '@faker-js/faker';
import { insertCategory } from '../db.js';

const { faker, commerce } = pkg;

const categories = [];
let categorie;

// insert into table catagories
for (let i = 0; i < 3; i += 1) {
  while (true) {
    categorie = faker.commerce.department()
    if (!categories.includes(categorie)) break;
  }
  console.log(categorie);

  categories.push(categorie);

}

  /*
  faker.commerce.department(),
  faker.commerce.price(),
    faker.commerce.productDescription(),

    faker.
*/


