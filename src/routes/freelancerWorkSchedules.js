const express = require('express');

module.exports = (app) => {
  const router = express.Router();
  router.get('/:freelancerId', async (req, res, next) => {
    try {
      const result = await app.services.freelancerWorkSchedule
        .getFreeSchedules(req.params.freelancerId, req.query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:freelancerId/:serviceId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerWorkSchedule.getOneFreelancerSchedule(req.params.id);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post('/:freelancerId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerWorkSchedule.addFreelancerSchedule(
        req.params.freelancerId,
        req.body,
        req.user,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:freelancerId/:scheduleId', async (req, res, next) => {
    try {
      const result = await
      app.services.freelancerWorkSchedule.updateFreelancerSchedule(req.params, req.body, req.user);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:freelancerId/:scheduleId', async (req, res, next) => {
    try {
      await app.services.freelancerWorkSchedule.deleteFreelancerSchedule(req.params, req.user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
};
