import { test, describe, expect } from '@jest/globals';

import { fetchAndParse, createRandomOrder, postAndParse } from './utils.js';

describe('orders', () => {
  test('GET /orders/:id', async () => {
    const { order } = await createRandomOrder();
    expect(order).toBeTruthy();

    const { result, status } = await fetchAndParse(`/orders/${order.id}`);

    expect(status).toBe(200);
  });
});
