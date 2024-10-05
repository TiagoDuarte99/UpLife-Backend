const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/', async (req, res, next) => {
    try {
      app.services.scheduling.getSchedulings2(req.query.page, req.query)
        .then((result) => {
          const { totalResults } = result;
          res.set('X-Total-Count', totalResults);
          res.status(200).json(result.schedulings);
        });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const result = await app.services.scheduling.getOneScheduling2({ id: req.params.id });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.scheduling.addScheduling(req.body, req.user);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:clientId/:schedulingId', async (req, res, next) => {
    try {
      const result = await app.services.scheduling
        .updateScheduling(req.params, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:clientId/:schedulingId', async (req, res, next) => {
    try {
      await app.services.scheduling.deleteScheduling(req.params, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
