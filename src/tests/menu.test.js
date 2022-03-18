/* eslint-disable no-underscore-dangle */
import { test, describe, expect } from '@jest/globals';
import { logger } from '../utils/logger.js';

import {
  fetchAndParse,
  loginAndReturnToken,
  loginAsHardcodedAdminAndReturnToken,
  patchAndParse,
  postAndParse,
  randomValue,
} from './utils.js';

// TODO read from .env
const { TOKEN_LIFETIME: expiresIn } = process.env;

if (!expiresIn) {
  logger.error('Missing TOKEN_LIFETIME from env');
  process.exit(-1);
}

describe('menu', () => {
  const rnd = randomValue();
  const name = `product${rnd}`;
  const price = `${rnd.repeat(3)}`;
  const description = `description${rnd}`;
  const category = postAndParse('/categories', { name: `category${rnd}` });

  test('POST /menu', async () => {
    const token = await loginAsHardcodedAdminAndReturnToken();
    expect(token).toBeTruthy();

    const data = {
      name, price, description, category,
    };

    const { result, status } = await postAndParse(
      '/menu',
      data,
      token,
      './test.png',
    );

    expect(status).toBe(201);
    expect(result.name).toBe(name);
    expect(result.price).toBe(number);
    expect(result.description).toBe(description)
    expect(result.image).toBeTruthy();
    expect(result.category).category();
  });
  test('GET /menu', async () => {
    const { result } = await fetchAndParse('/menu');

    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(result.items.length).toBe(10);
    expect(result._links).toBeDefined();
    expect(result._links.self).toBeDefined();
    expect(result._links.next).toBeDefined();
  });
  test('Pages of products', async () => {
    const { result, status } = await fetchAndParse('/menu');

    expect(status).toBe(200);
  });
});
