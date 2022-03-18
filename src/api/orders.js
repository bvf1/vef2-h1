import xss from 'xss';
import { pagedQuery, singleQuery, query, insertStateChange } from '../db.js';
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

  const orderLines = await query(
    `
    SELECT
      *
    FROM
        orderlines
    WHERE
        orderid = $1
    `,
    [orderId],
  );

  const totalPrice = await singleQuery(
    `
    SELECT
      SUM(o.quantity * pr.price)
    FROM
        products as pr
    INNER JOIN
        orderlines as o
    ON
        o.productid = pr.id
    WHERE
      orderid = $1
    `,
    [orderId],
  );

  if (!order) {
    return null;
  }

  orderLines.orders = order;
  orderLines.price = totalPrice;
  return orderLines;
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

  const orderChanges = await query(
    `
    SELECT
      *
    FROM
        statechanges
    WHERE
        orderid = $1
    `,
    [orderId],
  );

  orderStatus.changes = orderChanges;

  return orderStatus;
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    const updatedStatus = await singleQuery(
      `
      UPDATE
        userstates
      SET
        stateoforder = $1
        created
      WHERE
          orderid = $2
      `,
      [status, orderId],
    );

    insertStateChange(orderId, status);
    return res.status(200).json(updatedStatus);
  } catch (e) {
    logger.error(
      `unable to change status to "${status}" for user "${orderId}"`,
      e,
    );
  }

  return res.status(500).json(null);
}

export async function insertOrder({
  name,
}) {
  const q = `
  INSERT INTO orders
  (id, name)
  VALUES (gen_random_uuid(), $1)
  RETURNING *`;
  const values = [xss(name)];

  const result = await singleQuery(q, values);

  if (result) {
    return result;
  }

  return null;
}

export async function createOrder(req, res) {
  const { name } = req.body;

  const order = await insertOrder({ name });

  if (!order) return res.status(500).json({ msg: 'category was not created' });

  return res.status(201).json(order);
}
