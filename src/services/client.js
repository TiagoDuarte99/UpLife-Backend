const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const findAll = async (page, filter = {}) => {
    const currentPage = page || 1;
    const pageSize = 10;
    const offset = (currentPage - 1) * pageSize;

    const clients = await app.db('clients')
      .select([
        'clients.id',
        'clients.userId',
        'clients.firstName',
        'clients.lastName',
        'clients.birthdate',
        'clients.address',
        'clients.phoneNumber',
        'clients.photo',
      ])
      .limit(pageSize)
      .offset(offset);

    const totalCount = await app.db('clients').where(filter).count('id').first();
    const totalResults = parseInt(totalCount.count, 10);

    return { clients, totalResults };
  };

  const findOne = (filter = {}) => {
    return app.db('clients').where(filter).first();
  };

  const findOne2 = (filter) => {
    const clientId = filter.id;
    return app.db('clients')
      .leftJoin('users', 'clients.userId', 'users.id')
      .leftJoin('districts', 'clients.districtId', 'districts.id')
      .leftJoin('countys', 'clients.countyId', 'countys.id')
      .where('clients.id', clientId)
      .first()
      .select('clients.*', 'users.email', 'districts.name as districtName', 'countys.name as countyName');
  };

  const save = async (client) => {
    if (client) {
      if (!client.firstName) throw new ValidationError('O primeiro nome é um atributo obrigatório');
      if (!client.lastName) throw new ValidationError('O último nome é um atributo obrigatório');
      if (!client.birthdate) throw new ValidationError('A data de nascimento é um atributo obrigatório');

      const res = await app.services.user.save(
        {
          email: client.email,
          password: client.password,
          confirmPassword: client.confirmPassword,
        },
      );

      if (!res) throw new ValidationError('Utilizador não foi criado');
      const userId = res[0].id;

      const clientInsert = await app.db('clients').insert({
        userId,
        firstName: client.firstName,
        lastName: client.lastName,
        birthdate: client.birthdate,
      }, ['id', 'userId', 'firstName', 'lastName', 'birthdate']);
      return clientInsert[0];
    }

    throw new ValidationError('Utilizador não foi criado');
  };

  const update = async (id, client, userAuths) => {
    const idClient = userAuths.clientId.toString();
    if (idClient !== id) throw new ForbiddenError('Não tem autorização para editar outro cliente');

    const hasNonNullField = Object.entries(client).some(([key, value]) => key !== 'clientId' && value !== null);

    if (hasNonNullField) {
      const newFirstName = client.firstName;
      const newLastName = client.lastName;
      const newDistrictId = client.districtId;
      const newcountyId = client.countyId;
      const newAddress = client.address;
      const newBirthdate = client.birthdate;
      const newPhoneNumber = client.phoneNumber;
      const newPhoto = client.photo;

      await app.db('clients').where({ id }).update({
        ...(newFirstName && { firstName: newFirstName }),
        ...(newLastName && { lastName: newLastName }),
        ...(newDistrictId && { districtId: newDistrictId }),
        ...(newcountyId && { countyId: newcountyId }),
        ...(newAddress && { address: newAddress }),
        ...(newBirthdate && { birthdate: newBirthdate }),
        ...(newPhoneNumber && { phoneNumber: newPhoneNumber }),
        ...(newPhoto && { photo: newPhoto }),
      });

      const userAtualizado = await findOne({ id });
      return userAtualizado;
    }
    throw new ValidationError('Preencha pelo menos um campo antes de atualizar o freelancer');
  };

  const deleteClient = async (id, userAuths) => {
    const idClient = userAuths.clientId.toString();
    if (idClient !== id) throw new ForbiddenError('Não tem autorização para eliminar outro cliente');

    const resultado = await findOne({ id });
    if (!resultado) {
      throw new ValidationError('Cliente não encontrado');
    }

    const user = await app.services.user.findOne({ id: resultado.userId });
    if (!user) {
      throw new ValidationError('Utilizador não encontrado');
    }

    let clientDeleted = '';
    if (user) {
      clientDeleted = await app.db('clients').where({ id }).delete();

      if (clientDeleted) {
        await app.db('users').where({
          id: resultado.userId,
        }).del();
      }
    }

    return clientDeleted;
  };

  return {
    findAll, save, findOne, findOne2, update, deleteClient,
  };
};
