import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import multer from 'multer';

import {
  requireAuthentication,
  requireAdmin,
  addUserIfAuthenticated,
} from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fs-helpers.js';

import { listUsers, listUser, updateUser } from './users.js';

import {
  listOrders, listOrder, createOrder, listOrderStatus, updateOrderStatus,
} from './orders.js';

import {
  createCart,
} from './carts.js'

import {
  adminValidator,
  episodeIdValidator,
  episodeValidators,
  nameValidator,
  pagingQuerystringValidator,
  seasonIdValidator,
  serieIdValidator,
  seasonValidators,
  serieValidators,
  validateResourceExists,
  validateResourceNotExists,
  atLeastOneBodyValueValidator,
  validateRating,
  validateState,
} from '../validation/validators.js';
import { validationCheck } from '../validation/helpers.js';
import { listProducts } from './products.js';

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
  '/orders/:id/status',
  validateResourceExists(listOrderStatus),
  validationCheck,
  returnResource,
);

router.get(
  '/orders/:id',
  validateResourceExists(listOrder),
  validationCheck,
  returnResource,
);

router.post(
  '/orders',
  validationCheck,
  catchErrors(createOrder),
);

router.post(
  '/cart',
  validationCheck,
  catchErrors(createCart),
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
