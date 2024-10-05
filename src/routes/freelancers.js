const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.freelancer.findAllFreelancersSchedule(req.query.page, req.query)
      .then((result) => {
        const { totalResults } = result;
        res.set('X-Total-Count', totalResults);
        res.status(200).json(result.paginatedFreelancers);
      })
      .catch((err) => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.freelancer.findOne2(req.params)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => next(err));
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const result = await app.services.freelancer.update(req.params.id, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.freelancer.deleteFreelancer(req.params.id, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
