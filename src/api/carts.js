import {
  singleQuery, deleteQuery, query,
} from '../db.js';
import { logger } from '../utils/logger.js';

export async function createCart(req, res) {
  try {
    const createdCart = await singleQuery(
      `
      INSERT INTO carts
        (id)
      VALUES
        (gen_random_uuid())
      RETURNING id;
    `,
      [],
    );
    return res.status(200).json(createdCart);
  } catch (e) {
    logger.error(
      'unable to create cart',
      e,
    );
  }

  return res.status(500).json(null);
}

export async function listCart(cartId) {
  const cart = await singleQuery(
    `
    SELECT
      *
    FROM
        carts
    WHERE
        id = $1
    `,
    [cartId],
  );

  const cartLines = await query(
    `
    SELECT
      *
    FROM
        cartlines
    WHERE
        cartid = $1
    `,
    [cartId],
  );

  const totalPrice = await singleQuery(
    `
    SELECT
      SUM(c.quantity * pr.price)
    FROM
        products as pr
    INNER JOIN
        cartlines as c
    ON
        c.productid = pr.id
    WHERE
      cartid = $1
    `,
    [cartId],
  );

  if (!cart) {
    return null;
  }

  cartLines.cart = cart;
  cartLines.price = totalPrice;
  return cartLines;
}

export async function createCartLine(req) {
  const productID = req.params.id;
  const { cartID, quantity } = req.body;
  const q = `
    INSERT INTO cartlines
      (productid, cartid, quantity)
    VALUES
      ($1, $2, $3)
    RETURNING productid, cartid, quantity;
  `;
  const values = [productID, cartID, quantity];
  const result = await singleQuery(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function removeCart(req) {
  const { id } = req.params.id;

  const q = `
    DELETE FROM
      carts
    WHERE
      cartid = $1
  `;
  const values = [id];

  try {
    const deletionRowCount = await deleteQuery(q, values);

    if (deletionRowCount === 0) {
      return id;
    }
    return null;
  } catch (e) {
    logger.error(
      `unable to delete cart ${id}`,
      e,
    );
  }

  return null;
}

export async function listCartLine(req) {
  const { cartId, id } = req.params;

  const cartLines = await query(
    `
    SELECT
      *
    FROM
        cartlines
    WHERE
        cartid = $1
    `,
    [cartId, id],
  );
  return cartLines;
}

export async function updateCartLine(req, res) {
  return null;
}

export async function removeCartLine(req, res) {
  return null;
}
