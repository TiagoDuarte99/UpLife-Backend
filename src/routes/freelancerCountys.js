const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/:freelancerId', async (req, res, next) => {
    try {
      app.services.freelancerCounty.getFreelancerCountys(req.query)
        .then((result) => {
          const { totalResults } = result;
          res.set('X-Total-Count', totalResults);
          res.status(200).json(result);
        });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:freelancerId/:countyId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerCounty.getOneFreelancerCounty(req.params.freelancerId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/:freelancerId', async (req, res, next) => {
    try {
      const result = await app.services.freelancerCounty.addFreelancerCountys(
        req.params.freelancerId,
        req.body,
        req.user,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:freelancerId/:countyId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerCounty.updateFreelancerCounty(req.params, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:freelancerId/:countyId', async (req, res, next) => {
    try {
      await app.services.freelancerCounty.deleteFreelancerCounty(req.params, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
