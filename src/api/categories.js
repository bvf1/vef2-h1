import xss from 'xss';
import {
  query,
  singleQuery,
  pagedQuery,
  deleteQuery,
  conditionalUpdate,
  insertCategory,
  insertProduct,
  listCategoryNames,
} from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { uploadImage } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';
import { listOrders } from './orders.js';

export async function listCategories(req, res) {
  const { offset = 0, limit = 10 } = req.query;
  const series = await pagedQuery(
    `SELECT
    *
    FROM
    categories
    ORDER BY title ASC`,
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

export async function createCategory(req, res) {
  const { title } = req.body;

  const category = await insertCategory({ title });

  if (!category) return res.status(500);

  return res.status(201).json(category);
}
