import { test, describe, expect } from '@jest/globals';

import { fetchAndParse, createRandomOrder } from './utils.js';

describe('orders', () => {
  test('GET /orders/:id', async () => {
    const { order } = await createRandomOrder();
    expect(order).toBeTruthy();

    const { result, status } = await fetchAndParse('/orders/08626326-a55f-11ec-b909-0242ac120002');

    expect(status).toBe(200);
  });
});
