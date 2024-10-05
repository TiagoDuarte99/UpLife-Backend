const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const findAllCountys = (filter = {}) => {
    const countys = app
      .db('countys')
      .innerJoin('districts', 'countys.districtId', '=', 'districts.id')
      .where(filter)
      .select(
        'countys.name as countyName',
        'districts.name as districtName',
        'countys.id as id',
      );

    return countys;
  };

  const findOneCounty = (filter = {}) => {
    return app.db('countys').where(filter).first();
  };

  const saveCounty = async (county, userAuths) => {
    if (county !== undefined && Object.keys(county).length > 0) {
      const userEmail = userAuths.email;
      if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização inserir concelhos');

      if (!county.name) {
        throw new ValidationError(
          'O nome do concelho é um atributo obrigatório',
        );
      }
      if (!county.districtId) { throw new ValidationError('O distrito é um atributo obrigatório'); }

      const res = await app.db('districts').where({
        id: county.districtId,
      });

      if (!res) throw new ValidationError('Distrito não existe');

      const countyInsert = await app.db('countys').insert(
        {
          name: county.name,
          districtId: county.districtId,
        },
        ['name', 'id'],
      );
      return countyInsert[0];
    }

    throw new ValidationError('Concelho não foi guardado');
  };

  const updateCounty = async (id, county, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização alterar concelhos');

    const resultado = await findOneCounty({ id });
    if (!resultado) {
      throw new ValidationError('Concelho não encontrado');
    }
    const newName = county.name;
    const newDistrictId = county.districtId;

    const res = await app.db('districts').where({
      id: newDistrictId,
    });

    if (!res) throw new ValidationError('Distrito não existe');

    await app
      .db('countys')
      .where({ id })
      .update({
        ...(newName && { name: newName }),
        ...(newDistrictId && { districtId: newDistrictId }),
      });

    const countyUpdate = await findOneCounty({ id });
    return countyUpdate;
  };

  const deleteCounty = async (id, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização apagar concelhos');

    const resultado = await findOneCounty({ id });
    if (!resultado) {
      throw new ValidationError('Concelho não encontrado');
    }

    const countyDeleted = await app.db('countys').where({ id }).delete();

    return countyDeleted;
  };

  return {
    findAllCountys,
    findOneCounty,
    saveCounty,
    updateCounty,
    deleteCounty,
  };
};
