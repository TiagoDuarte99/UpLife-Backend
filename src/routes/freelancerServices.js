const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/:freelancerId', async (req, res, next) => {
    try {
      app.services.freelancerService.getServices(req.query)
        .then((result) => {
          const { totalResults } = result;
          res.set('X-Total-Count', totalResults);
          res.status(200).json(result);
        });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:freelancerId/:serviceId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerService.getOneService(req.params);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/:freelancerId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerService.addServices(req.params.freelancerId, req.body, req.user);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:freelancerId/:serviceId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerService.updateService(req.params, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:freelancerId/:serviceId', async (req, res, next) => {
    try {
      await app.services.freelancerService.deleteService(req.params, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
