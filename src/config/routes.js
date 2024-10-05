module.exports = (app) => {
  app.route('/auth/signin').post(app.routes.auths.signin);
  app.route('/auth/signup/freelancers').post(app.routes.freelancers.create);
  app.route('/auth/signup/clients').post(app.routes.clients.create);

  // swagger ok
  app
    .route('/users')
    .post(app.routes.users.create)// ok
    .all(app.config.passport.authenticate())
    .get(app.routes.users.findAll);// ok

  // swagger ok
  app
    .route('/users/:id')
    .all(app.config.passport.authenticate())
    .get(app.routes.users.findOne)
    .put(app.routes.users.update)
    .delete(app.routes.users.deleteUser);

  // swagger ok
  app
    .route('/clients')
    .all(app.config.passport.authenticate())
    .get(app.routes.clients.findAll);

  // swagger ok
  app
    .route('/clients/:id')
    .all(app.config.passport.authenticate())
    .get(app.routes.clients.findOne)
    .put(app.routes.clients.update)
    .delete(app.routes.clients.deleteClient);

  // swagger ok
  app
    .route('/freelancers')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancers.findAll);

  // swagger ok
  app
    .route('/freelancers/:id')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancers.findOne)
    .put(app.routes.freelancers.update)
    .delete(app.routes.freelancers.deleteFreelancer);

  // swagger ok
  app
    .route('/serviceTypes')
  // .all(app.config.passport.authenticate())//TODO ver isto Admin apenass
    .get(app.routes.serviceTypes.getServicesTypes)
    .post(app.routes.serviceTypes.createService);

  app
    .route('/serviceTypes/:id')
    // .all(app.config.passport.authenticate())//TODO ver isto
    .get(app.routes.serviceTypes.getOneServices)
    .put(app.routes.serviceTypes.updateService)
    .delete(app.routes.serviceTypes.deleteService);

  // swagger nao esta ok
  app
    .route('/districts')
    // .all(app.config.passport.authenticate())//TODO ver isto Admin apenas
    .get(app.routes.districts.findAllDistricts)
    .post(app.routes.districts.createDistrict);

  app
    .route('/districts/:id')
    // .all(app.config.passport.authenticate())//TODO ver isto
    .get(app.routes.districts.findOneDistrict)
    .put(app.routes.districts.updateDistrict)
    .delete(app.routes.districts.deleteDistrict);

  app
    .route('/countys')
    // .all(app.config.passport.authenticate())//TODO ver isto Admin apenas
    .get(app.routes.countys.findAllCountys)
    .post(app.routes.countys.createCounty);

  app
    .route('/countys/:id')
    // .all(app.config.passport.authenticate())//TODO ver isto
    .get(app.routes.countys.findOneCounty)
    .put(app.routes.countys.updateCounty)
    .delete(app.routes.countys.deleteCounty);

  // swagger ok

  app
    .route('/freelancers/:id/services')
    .all(app.config.passport.authenticate())
    .post(app.routes.freelancerServices.addServices)
    .get(app.routes.freelancerServices.getServices);

  app
    .route('/freelancers/:id/services/:serviceId')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancerServices.getOneService)
    .put(app.routes.freelancerServices.updateService)
    .delete(app.routes.freelancerServices.deleteService);

  app.route('/freelancers/:id/countys')
    .all(app.config.passport.authenticate())
    .post(app.routes.freelancerCountys.addFreelancerCountys)
    .get(app.routes.freelancerCountys.getFreelancerCountys);

  app.route('/freelancers/:id/countys/:countyId')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancerCountys.getOneFreelancerCounty)
    .put(app.routes.freelancerCountys.updateFreelancerCounty)
    .delete(app.routes.freelancerCountys.deleteFreelancerCounty);

  app.route('/freelancers/:id/schedules')
    .all(app.config.passport.authenticate())
    .post(app.routes.freelancerWorkSchedules.addFreelancerSchedule)
    .get(app.routes.freelancerWorkSchedules.getFreelancerSchedules);

  app.route('/freelancers/:id/schedules/:scheduleId')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancerWorkSchedules.getOneFreelancerSchedule)
    .put(app.routes.freelancerWorkSchedules.updateFreelancerSchedule)
    .delete(app.routes.freelancerWorkSchedules.deleteFreelancerSchedule);
  // --------------------ta ate aqui ------------

  app.route('/schedulings')
    .all(app.config.passport.authenticate())
    .post(app.routes.schedulings.addSchedulings)
    .get(app.routes.schedulings.getSchedulings);

  app.route('/freeSchedulings')
    .all(app.config.passport.authenticate())
    .get(app.routes.freelancers.findAllFreelancersSchedules);
/*
  app.route('/schedulings/:id')
    .all(app.config.passport.authenticate())
    //.get(app.routes.schedulings.findOne)
    .put(app.routes.schedulings.update)
    //.delete(app.routes.schedulings.delete);

  app.route('/schedulings/client/:client_id')
    .all(app.config.passport.authenticate())
    .get(app.routes.schedulings.findByClient);

  app.route('/schedulings/freelancer/:freelancerId')
    .all(app.config.passport.authenticate())
    .get(app.routes.schedulings.findByFreelancer);
*/
};
