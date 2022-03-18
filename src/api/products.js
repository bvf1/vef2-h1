import xss from 'xss';
import {
  pagedQuery,
  insertProduct,
  listCategoryByTitle,
  listCategoryById,
  conditionalUpdate,
  deleteProduct,
} from '../db.js';
import { addPageMetadata } from '../utils/addPageMetadata.js';
import { uploadImage, uploadToCloudinarY } from '../utils/cloudinary.js';
import { isString } from '../utils/isString.js';
import { logger } from '../utils/logger.js';

export async function listProducts(req, res) {
  const { search, description } = req.query;
  let where = '';
  let category;

  const values = [];
  if (search) {
    category = await listCategoryByTitle({ title: xss(search) });
    if (category !== null) {
      values.push(category.id);
      where += 'WHERE category = $1';
    }
  }

  if (description) {
    if (where === '') where += 'WHERE description like $1';
    else where += ' AND description like $2';
    const s = `%${description}%`;
    values.push(s);
  }

  const { offset = 0, limit = 10 } = req.query;

  const series = await pagedQuery(
    `SELECT
        *
      FROM
        products
        ${where}
      ORDER BY updated DESC`,
    values,
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
    title,
    price,
    description,
    category,
  } = req.body;

  const { path: imagePath } = req.file;
  const image = await uploadToCloudinarY(res, imagePath);

  const result = await listCategoryByTitle({ title: category });
  const { id } = result;

  const product = await insertProduct({
    title, price, description, image, category: id,
  });

  if (!product) return res.status(500);

  return res.status(201).json(product);
}

export async function listCategory(req) {
  const id = req;

  const category = await listCategoryById({ id });

  if (!category) {
    return null;
  }

  return category;
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  let categoryId;

  if (body.category) {
    const cate = body.category;
    const category = await listCategoryByTitle({ title: cate });
    const num = category.id;
    categoryId = num.toString();
  }

  const fields = [
    isString(body.title) ? 'title' : null,
    isString(body.price) ? 'price' : null,
    isString(body.description) ? 'description' : null,
    isString(body.category) ? 'category' : null,
  ];

  const values = [
    isString(body.title) ? xss(body.title) : null,
    isString(body.price) ? xss(body.price) : null,
    isString(body.description) ? xss(body.description) : null,
    isString(categoryId) ? categoryId : null,

  ];

  if (imagePath) {
    // TODO refactor into helper in cloudinary.js, same as above
    let poster;
    try {
      const uploadResult = await uploadImage(imagePath);
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('no secure_url from cloudinary upload');
      }
      poster = uploadResult.secure_url;
    } catch (e) {
      logger.error('Unable to upload file to cloudinary', e);
      return res.status(500).end();
    }

    fields.push('image');
    values.push(poster);
  }

  const result = await conditionalUpdate('products', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}

export async function removeProduct(req, res) {
  const { id } = req.params;

  const wasDeleted = await deleteProduct({ id });

  if (wasDeleted) return res.status(204).json({ msg: 'product was deleted' });

  return res.status(500).json({ msg: 'product did not exist' });
}
