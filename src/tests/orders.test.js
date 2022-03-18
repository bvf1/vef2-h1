import { test, describe, expect } from '@jest/globals';

import { fetchAndParse } from './utils.js';

describe.skip('orders', () => {
  test('GET /orders/:id', async () => {
    const { result, status } = await fetchAndParse('/orders/08626326-a55f-11ec-b909-0242ac120002');

    expect(status).toBe(404);
    expect(result.price).toBe(80);
    expect(result.orders).toBeDefined();
    expect(result.rows).toBeDefined();
  });
});
