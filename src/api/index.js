import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import multer from 'multer';

import {
  requireAdmin,
} from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fs-helpers.js';

import { listUsers, listUser, updateUser } from './users.js';

import {
  listOrders, listOrder, createOrder, listOrderStatus, updateOrderStatus,
} from './orders.js';

import {
  createCart,
  listCart,
  createCartLine,
  removeCart,
  listCartLine,
  updateCartLine,
  removeCartLine,
} from './carts.js';

import {
  adminValidator,
  pagingQuerystringValidator,
  validateResourceExists,
  nameValidator,
  atLeastOneBodyValueValidator,
  productValidators,
  categoryValidator,
  productTitleValidator,
  numberValidator,
} from '../validation/validators.js';
import { validationCheck } from '../validation/helpers.js';
import {
  createProduct, listProducts, removeProduct, updateProduct,
} from './products.js';
import {
  createCategory, listCategories, listCategory, patchCategory, productsByCategory, removeCategory,
} from './categories.js';
import { listProduct } from '../db.js';

/**
 * Langt skjal! En hér erum við að útbúa hverja og einasta route (fyrir utan
 * auth) í API. Notar declerative validation sem er öll skilgreind í
 * `/src/validation`.
 */

// TODO færa í .env
const MULTER_TEMP_DIR = './temp';

/**
 * Hjálparfall til að bæta multer við route.
 */
function withMulter(req, res, next) {
  multer({ dest: MULTER_TEMP_DIR }).single('image')(req, res, (err) => {
    if (err) {
      if (err.message === 'Unexpected field') {
        const errors = [
          {
            field: 'image',
            error: 'Unable to read image',
          },
        ];
        return res.status(400).json({ errors });
      }

      return next(err);
    }

    return next();
  });
}

export const router = express.Router();

function returnResource(req, res) {
  return res.json(req.resource);
}

// Sækjum yfirlit yfir API úr index.json og sendum beint út
router.get('/', async (req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  const indexJson = await readFile(join(path, './index.json'));
  res.json(JSON.parse(indexJson));
});

/**
 * Hér fylga allar skilgreiningar á routes, þær fylgja eftirfarandi mynstri:
 *
 * router.HTTP_METHOD(
 *  ROUTE_WITH_PARAM,
 *  VALIDATOR_MIDDLEWARE_1,
 *  ...
 *  VALIDATOR_MIDDLEWARE_N,
 *  validationCheck, // Sendir validation villur, ef einhverjar
 *  RESULT, // Eitthvað sem sendir svar til client ef allt OK
 * );
 */
router.get(
  '/menu',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listProducts),
);

router.get(
  '/menu?search={query}',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(productsByCategory),
);

router.get(
  '/menu/:id',
  validateResourceExists(listProduct),
  validationCheck,
  returnResource,
);

router.get(
  '/orders/:id/status',
  validateResourceExists(listOrderStatus),
  validationCheck,
  returnResource,
);

router.get(
  '/categories',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listCategories),
);

router.get(
  '/orders/:id',
  validateResourceExists(listOrder),
  validationCheck,
  returnResource,
);

router.post(
  '/orders',
  nameValidator,
  validationCheck,
  catchErrors(createOrder),
);

router.post(
  '/cart',
  validationCheck,
  catchErrors(createCart),
);

router.get(
  '/cart/:id',
  validateResourceExists(listCart),
  validationCheck,
  returnResource,
);

router.post(
  '/cart/:id',
  validateResourceExists(listCart),
  numberValidator,
  validationCheck,
  catchErrors(createCartLine),
);

router.delete(
  '/cart/:id',
  validateResourceExists(listCart),
  catchErrors(removeCart),
);

router.get(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine),
  validationCheck,
  returnResource,
);

router.patch(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine),
  validationCheck,
  catchErrors(updateCartLine),
);

router.delete(
  '/cart/:id/line/:lineid',
  validateResourceExists(listCartLine),
  catchErrors(removeCartLine),
);

/* admin auth routes */

router.get(
  '/users',
  requireAdmin,
  pagingQuerystringValidator,
  validationCheck,
  listUsers,
);

router.get(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  validationCheck,
  returnResource,
);

router.patch(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  adminValidator,
  validationCheck,
  catchErrors(updateUser),
);

router.post(
  '/menu',
  requireAdmin,
  withMulter,
  productValidators,
  validationCheck,
  catchErrors(createProduct),
);

router.patch(
  '/menu/:id',
  requireAdmin,
  withMulter,
  productTitleValidator,
  productValidators,
  atLeastOneBodyValueValidator([
    'title',
    'price',
    'description',
    'image',
    'category',
  ]),
  validationCheck,
  catchErrors(updateProduct),
);

router.delete(
  '/menu/:id',
  requireAdmin,
  catchErrors(removeProduct),
);

router.post(
  '/categories',
  requireAdmin,
  categoryValidator,
  validationCheck,
  catchErrors(createCategory),
);

router.patch(
  '/categories/:id',
  requireAdmin,
  categoryValidator,
  validateResourceExists(listCategory),
  validationCheck,
  catchErrors(patchCategory),
);

router.delete(
  '/categories/:id',
  requireAdmin,
  catchErrors(removeCategory),
);

router.get(
  '/orders',
  requireAdmin,
  pagingQuerystringValidator,
  validationCheck,
  listOrders,
);

router.post(
  '/orders/:id/status',
  requireAdmin,
  validateResourceExists(listOrder),
  validationCheck,
  catchErrors(updateOrderStatus),
);

/* user auth routes */
