import xss from 'xss';
import {
  query,
  singleQuery,
  pagedQuery,
  deleteQuery,
  conditionalUpdate,
} from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { uploadImage } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';

export async function listProducts(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const series = await pagedQuery(
    `SELECT
        *
      FROM
        products
      ORDER BY updated DESC`,
    [],
    { offset, limit },
  );

  const seriesWithPage = addPageMetadata(series, req.path, {
    offset,
    limit,
    length: series.items.length,
  });

  return res.json(seriesWithPage);
}
