import xss from 'xss';
import {
  query,
  pagedQuery,
  insertCategory,
  insertProduct,
  listCategoryNames,
  listCategoryByTitle,
} from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { uploadImage } from '../utils/cloudinary.js';
import { logger } from '../utils/logger.js';
import { listOrders } from './orders.js';

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

export async function createProduct(req, res) {
  const {
    title = '', price = '', description = '', category = '',
  } = req.body;

  const result = await listCategoryByTitle({ title: category });
  const { id } = result;

  const product = await insertProduct({
    title, price, description, category: id,
  });

  if (!product) return res.status(500);

  return res.status(201).json(product);
}
