import { pagedQuery, singleQuery } from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { logger } from '../utils/logger.js';

export async function listOrders(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const orders = await pagedQuery(
    `SELECT
        id, created, name
      FROM
        orders
      ORDER BY created ASC`,
    [],
    { offset, limit },
  );

  const ordersWithPage = addPageMetadata(
    orders,
    req.path,
    { offset, limit, length: orders.items.length },
  );

  return res.json(ordersWithPage);
}

export async function listOrder(orderId) {
  const order = await singleQuery(
    `
    SELECT
      o.id, o.created, o.name, os.orderid, os.stateoforder, os.created
    FROM
        orders AS o
    LEFT JOIN
        orderstates as os
    ON
        o.id = os.orderid
    WHERE
        id = $1
    `,
    [orderId],
  );

  if (!order) {
    return null;
  }

  return order;
}

export async function listOrderStatus(orderId) {
  const orderStatus = await singleQuery(
    `
    SELECT
      o.name, os.stateoforder, os.created
    FROM
        orders AS o
    LEFT JOIN
        orderstates as os
    ON
        o.id = os.orderid
    WHERE
        id = $1
    `,
    [orderId],
  );

  if (!orderStatus) {
    return null;
  }

  return orderStatus;
}

export async function createOrder(req, res) {
  const { name } = req.body;
  const q = `
    INSERT INTO orders
      (name)
    VALUES
      ($1)
    RETURNING id, created, name;
  `;
  const values = [name];
  const result = await singleQuery(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
