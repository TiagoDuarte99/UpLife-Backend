const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.client.findAll(req.query.page, req.params);
      const { totalResults } = result;
      res.set('X-Total-Count', totalResults);
      res.status(200).json(result.clients);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.client.findOne2(req.params);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });
  // TODO create esta no auths
  router.put('/:id', async (req, res, next) => {
    try {
      const result = await app.services.client.update(req.params.id, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.client.deleteClient(req.params.id, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
