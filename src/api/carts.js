import { pagedQuery, singleQuery } from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { logger } from '../utils/logger.js';

export async function createCart(req, res) {
  const { name } = req.body;

  try {
    const createdCart = await singleQuery(
      `
      INSERT INTO carts
        (name, id)
      VALUES
        ($1, gen_random_uuid())
      RETURNING name, id;
    `,
      [name],
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
