const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/', async (req, res, next) => {
    try {
      const result = await app.services.serviceType.getServicesTypes(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    app.services.serviceType.getOneServices(req.params)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => next(err));
  });

  router.post('/', async (req, res, next) => {
    try {
      const result = await app.services.serviceType.createService(req.body, req.user);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const result = await app.services.serviceType.updateService(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.serviceType.deleteService(req.params.id, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
