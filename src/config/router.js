const express = require('express');

module.exports = (app) => {
  app.use('/auth', app.routes.auths);

  const secureRouter = express.Router();

  secureRouter.use('/users', app.routes.users);
  secureRouter.use('/clients', app.routes.clients);
  secureRouter.use('/freelancers', app.routes.freelancers);
  secureRouter.use('/serviceTypes', app.routes.serviceTypes);
  secureRouter.use('/districts', app.routes.districts);
  secureRouter.use('/countys', app.routes.countys);
  secureRouter.use('/freelancerServices', app.routes.freelancerServices);
  secureRouter.use('/freelancerCountys', app.routes.freelancerCountys);
  secureRouter.use('/freelancersSchedules', app.routes.freelancerWorkSchedules);
  secureRouter.use('/schedulings', app.routes.schedulings);
  secureRouter.use('/mat', app.routes.mats);

  app.use(app.config.passport.authenticate(), secureRouter);
};
