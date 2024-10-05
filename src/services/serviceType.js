const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const getServicesTypes = (filter = {}) => {
    return app.db('serviceTypes')
      .where(filter)
      .select(['id', 'name'])
      .orderBy('id')
      .then((serviceTypes) => serviceTypes.map((serviceType) => ({
        id: serviceType.id,
        name: serviceType.name,
      })));
  };

  const getOneServices = (filter = {}) => {
    return app.db('serviceTypes').where(filter).first();
  };

  const createService = async (service, userAuths) => {
    if (service) {
      const userEmail = userAuths.email;
      if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização inserir serviços');

      if (!service.name) throw new ValidationError('O nome é um atributo obrigatório');

      const existingService = await getOneServices({ name: service.name });
      if (existingService) {
        throw new ValidationError('Já existe um serviço com esse nome');
      }

      const serviceInsert = await app.db('serviceTypes').insert({
        name: service.name,
      }, ['id', 'name']);
      return serviceInsert[0];
    }

    throw new ValidationError('Serviço não foi guardado');
  };

  const updateService = async (id, service, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização alterar serviços');

    const existingService = await getOneServices({ id });

    if (!existingService) {
      throw new ValidationError('Esse serviço nao existe');
    }
    const newServiceName = service.name;

    const existingNewService = await getOneServices({ name: newServiceName });
    if (existingNewService) {
      throw new ValidationError('Esse serviço já existe');// teste
    }

    await app.db('serviceTypes').where({ id }).update({
      ...(newServiceName && { name: newServiceName }),
    });

    const serviceUpdate = await getOneServices({ id });
    return serviceUpdate;
  };

  const deleteService = async (id, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização apagar serviços');

    const existingService = await getOneServices({ id });
    if (!existingService) {
      throw new ValidationError('Esse serviço nao existe');// teste
    }

    const serviceDeleted = await app.db('serviceTypes').where({ id }).delete();

    return serviceDeleted;
  };

  return {
    getServicesTypes, getOneServices, createService, updateService, deleteService,
  };
};
