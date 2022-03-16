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


export async function createProduct(req, res) {
  // TODO seasonId/number mismatch
  const { serieId, seasonId: seasonNumber } = req.params;
  const {
    name, number, overview = null, airDate = null,
  } = req.body;

  // TODO error handling
  const actualSeasonId = await seasonIdBySeasonNumber(serieId, seasonNumber);

  try {
    // TODO refactor, use db.js insertEpisode
    const episode = await singleQuery(
      `
        INSERT INTO
          episodes (name, "number", air_date, overview, seasonId, serieId)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING
          id, name, "number", air_date, overview, seasonId, serieId
      `,
      [
        xss(name),
        xss(number),
        airDate,
        xss(overview),
        xss(actualSeasonId),
        xss(serieId),
      ],
    );
    return res.status(201).json(episode);
  } catch (e) {
    logger.error('unable to create episode', e);
  }

  return res.status(500).json(null);
}
