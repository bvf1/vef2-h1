import { pagedQuery, singleQuery } from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
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
