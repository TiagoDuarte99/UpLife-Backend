const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const findAllDistricts = (filter = {}) => {
    const districts = app.db('districts')
      .where(filter)
      .select(['name', 'id']);

    return districts;
  };

  const findOneDistrict = (filter = {}) => {
    return app.db('districts').where(filter).first();
  };

  const saveDistrict = async (district, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização inserir distritos');

    if (district !== undefined && Object.keys(district).length > 0) {
      const districtInsert = await app.db('districts').insert(
        {
          name: district.name,
        },
        ['name', 'id'],
      );
      return districtInsert[0];
    }
    throw new ValidationError('O distrito não foi inserido');
  };

  const updateDistrict = async (id, district, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização alterar distritos');

    const resultado = await findOneDistrict({ id });
    if (!resultado) {
      throw new ValidationError('Distrito não encontrado');
    }
    const newName = district.name;

    await app
      .db('districts')
      .where({ id })
      .update({
        ...(newName && { name: newName }),
      });

    const districtUpdate = await findOneDistrict({ id });
    return districtUpdate;
  };

  const deleteDistrict = async (id, userAuths) => {
    const userEmail = userAuths.email;
    if (userEmail !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização apagar distritos');

    const resultado = await findOneDistrict({ id });
    if (!resultado) {
      throw new ValidationError('Distrito não encontrado');
    }

    await app.db('countys').where({ districtId: id }).delete();

    const districtDeleted = await app.db('districts').where({ id }).delete();

    return districtDeleted;
  };

  return {
    findAllDistricts,
    findOneDistrict,
    saveDistrict,
    updateDistrict,
    deleteDistrict,
  };
};
