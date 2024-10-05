const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const getOneService = (filter = {}) => {
    return app.db('freelancerServices').where(filter).first();
  };

  const addServices = async (id, freelancerServices, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização inserir serviço a outro freelancer');

    if (freelancerServices !== undefined && Object.keys(freelancerServices).length > 0) {
      if (!freelancerServices.serviceTypeId) throw new ValidationError('O id do tipo de serviço é um atributo obrigatório');
      if (!freelancerServices.pricePerHour) throw new ValidationError('O preço por hora é um atributo obrigatório');

      const resultServicesTypes = await app.services.serviceType.getServicesTypes({
        id: freelancerServices.serviceTypeId,
      });

      if (!resultServicesTypes || resultServicesTypes.length === 0) {
        throw new ValidationError('Tipo de serviço não existe');
      }

      const resultFreeService = await getOneService({
        freelancerId: id,
        serviceTypeId: freelancerServices.serviceTypeId,
      });

      if (resultFreeService) {
        throw new ValidationError('O freelancer já tem esse serviço');
      }

      const serviceFreelancer = await app.db('freelancerServices').insert({
        freelancerId: id,
        serviceTypeId: freelancerServices.serviceTypeId,
        pricePerHour: freelancerServices.pricePerHour,
      }, ['freelancerId', 'serviceTypeId', 'pricePerHour']);
      return serviceFreelancer[0];
    }
    throw new ValidationError('O serviço nao foi atribuido ao utilizador');
  };

  const getServices = async (filter = {}) => {
    const { page } = filter;
    const currentPage = page || 1;
    const pageSize = 10;
    const offset = (currentPage - 1) * pageSize;
    let newFilter = {};

    if (filter.serviceTypeId) {
      newFilter['freelancerServices.serviceTypeId'] = filter.serviceTypeId;
    }
    if (filter.freelancerId) {
      newFilter = { ...newFilter, 'freelancerServices.freelancerId': filter.freelancerId };
    }
    if (filter.pricePerHour) {
      newFilter = { ...newFilter, 'freelancerServices.pricePerHour': filter.pricePerHour };
    }

    const freelancerServices = await app.db('freelancerServices')
      .where(newFilter)
      .select([
        'freelancerServices.freelancerId',
        'freelancers.firstName as freelancerName',
        'serviceTypes.id as serviceId',
        'serviceTypes.name as serviceTypeName',
        'freelancerServices.pricePerHour',
      ])
      .innerJoin('freelancers', 'freelancerServices.freelancerId', 'freelancers.id')
      .innerJoin('serviceTypes', 'freelancerServices.serviceTypeId', 'serviceTypes.id')
      .limit(pageSize)
      .offset(offset);

    return freelancerServices;
  };
  const updateService = async ({ freelancerId: id, serviceId }, freelancerServices, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para editar outro serviços de outro freelancer');
    if (freelancerServices !== undefined && Object.keys(freelancerServices).length > 0) {
      const freelancerId = id;
      const freelancerServiceId = serviceId;

      const newServiceTypeId = freelancerServices.serviceTypeId;
      const newPricePerHour = freelancerServices.pricePerHour;

      if (newServiceTypeId) {
        const resultServicesTypes = await app.services.serviceType.getServicesTypes({
          id: newServiceTypeId,
        });

        if (!resultServicesTypes || resultServicesTypes.length === 0) {
          throw new ValidationError('Tipo de serviço não existe');
        }

        const resultadoOneService = await getOneService({
          freelancerId,
          serviceTypeId: newServiceTypeId,
        });

        if (resultadoOneService) {
          throw new ValidationError('O freelancer já tem esse serviço associado');
        }
      }

      const resultFreeService = await getOneService({
        freelancerId,
        serviceTypeId: freelancerServiceId,
      });

      if (!resultFreeService) {
        throw new ValidationError('O freelancer ainda nao tem esse serviço');
      }

      await app.db('freelancerServices').where({
        freelancerId,
        serviceTypeId: freelancerServiceId,
      }).update({
        ...(newServiceTypeId && { serviceTypeId: newServiceTypeId }),
        ...(newPricePerHour && { pricePerHour: newPricePerHour }),
      });

      if (newServiceTypeId) {
        const freelancerServicesUpdated = await getOneService({
          freelancerId,
          serviceTypeId: newServiceTypeId,
        });
        return freelancerServicesUpdated;
      }
      if (!newServiceTypeId) {
        const freelancerServicesUpdated = await getOneService({
          freelancerId,
          serviceTypeId: freelancerServiceId,
        });
        return freelancerServicesUpdated;
      }
    }
    throw new ValidationError('Tem de enviar algum dado para ser atualizado');
  };

  const deleteService = async ({ freelancerId: id, serviceId }, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para apagar um serviço a outro freelancer');

    if (id && serviceId) {
      const resultFreelancer = await app.services.freelancer.findOne({ id });
      if (!resultFreelancer) {
        throw new ValidationError('Utilizador não encontrado');
      }
      const freelancerServices = await getOneService({
        freelancerId: parseInt(id, 10),
        serviceTypeId: serviceId,
      });
      if (!freelancerServices) {
        throw new ValidationError('O utilizador não tem esse serviço');
      }
      return app.db('freelancerServices').where({
        freelancerId: id,
        serviceTypeId: serviceId,
      }).del();
    }

    throw new ValidationError('Tem de enviar algum dado para ser apagado');
  };

  return {
    addServices, getOneService, getServices, updateService, deleteService,
  };
};
