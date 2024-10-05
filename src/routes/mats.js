const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/media', async (req, res, next) => {
    try {
      const result = await app.services.mat.getAveragePriceByServiceType();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/moda', async (req, res, next) => {
    try {
      const result = await app.services.mat.getModeByServiceType();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/mediana', async (req, res, next) => {
    try {
      const result = await app.services.mat.getMedianByServiceType();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
