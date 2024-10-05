const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const getOneFreelancerCounty = (filter = {}) => {
    return app.db('countysFreelancerWork').where(filter).first();
  };

  const addFreelancerCountys = async (id, freelancerCounty, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização inserir concelho a outro freelancer');

    if (freelancerCounty !== undefined && Object.keys(freelancerCounty).length > 0) {
      if (!freelancerCounty.freelancerId) throw new ValidationError('O freelancer é um atributo obrigatório');
      if (!freelancerCounty.countyId) throw new ValidationError('O concelho é um atributo obrigatório');
      if (!freelancerCounty.districtId) throw new ValidationError('O distrito é um atributo obrigatório');

      const resultCountys = await app.services.county.findOneCounty({
        id: freelancerCounty.countyId,
      });

      if (!resultCountys || resultCountys.length === 0) throw new ValidationError('Concelho não existe');

      const resultDistrict = await app.services.district.findOneDistrict({
        id: freelancerCounty.districtId,
      });

      if (!resultDistrict || resultDistrict.length === 0) throw new ValidationError('Distrito não existe');

      if (resultCountys.districtId !== freelancerCounty.districtId) throw new ValidationError('O concelho nao pertence a esse distrito');

      const resultFreelancer = await app.services.freelancer.findOne({
        id: freelancerCounty.freelancerId,
      });

      if (!resultFreelancer || resultFreelancer.length === 0) throw new ValidationError('Freelancer não existe');

      const resGetOne = await getOneFreelancerCounty(
        {
          freelancerId: freelancerCounty.freelancerId,
          countyId: freelancerCounty.countyId,
        },
      );

      if (resGetOne) throw new ValidationError('Freelancer ja tem esse concelho associado');

      const insertedFreelancerCounty = await app.db('countysFreelancerWork').insert({
        freelancerId: freelancerCounty.freelancerId,
        countyId: freelancerCounty.countyId,
        districtId: freelancerCounty.districtId,
      }, ['freelancerId', 'countyId', 'districtId']);
      return insertedFreelancerCounty[0];
    }
    throw new ValidationError('O concelho não foi atribuído ao freelancer');
  };

  const getFreelancerCountys = async (filter = {}) => {
    const { page } = filter;
    const currentPage = page || 1;
    const pageSize = 10;
    const offset = (currentPage - 1) * pageSize;
    let newFilter = {};

    if (filter.countyId) {
      newFilter['countysFreelancerWork.countyId'] = filter.countyId;
    }
    if (filter.freelancerId) {
      newFilter = { ...newFilter, 'countysFreelancerWork.freelancerId': filter.freelancerId };
    }
    if (filter.districtId) {
      newFilter = { ...newFilter, 'countysFreelancerWork.districtId': filter.districtId };
    }
    const freelancerCounty = await app.db('countysFreelancerWork')
      .where(newFilter)
      .innerJoin('freelancers', 'freelancers.id', '=', 'countysFreelancerWork.freelancerId')
      .innerJoin('countys', 'countys.id', '=', 'countysFreelancerWork.countyId')
      .innerJoin('districts', 'districts.id', '=', 'countysFreelancerWork.districtId')
      .select([
        'countysFreelancerWork.freelancerId',
        'countys.name as countyName',
        'countys.id as countyId',
        'districts.name as districtName',
        'districts.id as districtId',
      ])
      .limit(pageSize)
      .offset(offset);
    return freelancerCounty;
  };

  const updateFreelancerCounty = async (
    { freelancerId: id, countyId },
    freelancerCounty,
    userAuths,
  ) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para editar o concelho de outro freelancer');

    if (freelancerCounty !== undefined && Object.keys(freelancerCounty).length > 0) {
      if (!freelancerCounty.freelancerId) throw new ValidationError('O freelancer é um atributo obrigatório');
      if (!freelancerCounty.countyId) throw new ValidationError('O concelho é um atributo obrigatório');
      if (!freelancerCounty.districtId) throw new ValidationError('O distrito é um atributo obrigatório');
      const freelancerId = id;
      const freelancerCountyId = countyId;

      const resultFreelancer = await app.services.freelancer.findOne(
        {
          id: freelancerCounty.freelancerId,
        },
      );
      if (!resultFreelancer) {
        throw new ValidationError('Freelancer não encontrado');
      }

      const resGetOne = await getOneFreelancerCounty(
        {
          freelancerId: freelancerCounty.freelancerId,
          countyId: freelancerCountyId,
        },
      );

      if (!resGetOne) throw new ValidationError('Freelancer não tem esse concelho associado');

      const newCountyId = freelancerCounty.countyId;
      const newDistrictId = freelancerCounty.districtId;

      if (newCountyId && newDistrictId) {
        const resultCountys = await app.services.county.findOneCounty({
          id: newCountyId,
          districtId: newDistrictId,
        });

        if (!resultCountys || resultCountys.length === 0) {
          throw new ValidationError('O concelho nao pertence a esse distrito');
        }

        const resNewGetOne = await getOneFreelancerCounty(
          {
            freelancerId: freelancerCounty.freelancerId,
            countyId: newCountyId,
          },
        );

        if (resNewGetOne) throw new ValidationError('Freelancer já tem o novo concelho associado');

        await app.db('countysFreelancerWork').where({
          freelancerId,
          countyId: freelancerCountyId,
        }).update({
          ...(newCountyId && { countyId: newCountyId }),
          ...(newDistrictId && { districtId: newDistrictId }),
        });
        const freelancerCountyUpdated = await getOneFreelancerCounty({
          freelancerId,
          countyId: newCountyId,
        });
        return freelancerCountyUpdated;
      }
    }
    throw new ValidationError('Tem de enviar algum dado para ser atualizado');
  };

  const deleteFreelancerCounty = async ({ freelancerId: id, countyId }, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para apagar um concelho a outro freelancer');

    if (id && countyId) {
      const resultFreelancer = await app.services.freelancer.findOne({ id });
      if (!resultFreelancer) {
        throw new ValidationError('Utilizador não encontrado');
      }
      const freelancerCounty = await getOneFreelancerCounty({
        freelancerId: id,
        countyId,
      });
      if (!freelancerCounty) {
        throw new ValidationError('O freelancer não tem esse concelho associado');// teste
      }
      return app.db('countysFreelancerWork').where({
        freelancerId: id,
        countyId,
      }).del();
    }

    throw new ValidationError('Tem de enviar algum dado para ser apagado');
  };

  return {
    addFreelancerCountys,
    getOneFreelancerCounty,
    getFreelancerCountys,
    updateFreelancerCounty,
    deleteFreelancerCounty,
  };
};
