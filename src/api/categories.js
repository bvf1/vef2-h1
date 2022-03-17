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
  listCategoryById,
  deleteCategory,
  listProductsByCategory,
  updateCategory,
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

  if (!category) return res.status(500).json({ msg: 'category was not created' });

  return res.status(201).json(category);
}

export async function patchCategory(req, res) {
  const { id } = req.params;
  const { title } = req.body;

  const updatedCategory = await updateCategory({ title, id });
  if (updatedCategory) {
    return res.status(200).json(updatedCategory);
  }

  return res.status(500).json(null);
}

export async function listCategory(req, res) {
  const id = req;

  const category = await listCategoryById({ id });

  if (!category) {
    return null;
  }

  return category;
}

export async function removeCategory(req, res) {
  const { id } = req.params;

  const wasDeleted = await deleteCategory({ id });
  if (wasDeleted === null) {
    return res.status(204).json({ msg: 'category was deleted' });
  }

  return res.status(500).json({ msg: 'category did not exist' });
}

export async function productsByCategory(req, res) {
  const { search } = req.params;

  const products = await listProductsByCategory({ title: search });

  if (!products) {
    return res.status(200);
  }

  return res.status(500).json(null);
}
