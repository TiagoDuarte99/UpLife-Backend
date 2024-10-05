const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const findAll = async (page, filter = {}) => {
    const currentPage = page || 1;
    const pageSize = 12;
    const offset = (currentPage - 1) * pageSize;

    const users = await app.db('users')
      .where(filter)
      .select(['id', 'email', 'lastTimeLogin', 'active'])
      .orderBy('id')
      .limit(pageSize)
      .offset(offset);

    const totalCount = await app.db('users').where(filter).count('id').first();
    const totalResults = parseInt(totalCount.count, 10);

    return { users, totalResults };
  };

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const findOne2 = async (filter = {}) => {
    const result = await app.db('users')
      .where(filter)
      .select(['id', 'email', 'lastTimeLogin', 'active'])
      .first();
    if (!result) {
      throw new ValidationError('Utilizador nao encontrado');
    }
    return result;
  };

  const getPasswdHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  const save = async (user) => {
    if (!user.email) {
      throw new ValidationError('O email é um atributo obrigatório');
    } else if (!isValidEmail(user.email)) {
      throw new ValidationError('O email deve ser válido');
    }

    if (!user.password) {
      throw new ValidationError('A password é obrigatória');
    } else if (!isValidPassword(user.password)) {
      throw new ValidationError('A password deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um dígito e um caractere especial');
    }
    if (user.password !== user.confirmPassword) {
      throw new ValidationError('A password não corresponde à confirmação de password.');
    }
    const userBD = await findOne({ email: user.email });
    if (userBD) throw new ValidationError('Email duplicado na Bd');

    const newUser = { ...user };
    delete newUser.confirmPassword;
    newUser.password = getPasswdHash(user.password);
    return app.db('users').insert(newUser, ['id', 'email']);
  };

  const update = async (id, user, userAuths) => {
    const idUser = userAuths.id.toString();
    if (idUser !== id && userAuths.email !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização para editar outro utilizador');
    if (user !== undefined && Object.keys(user).length > 0) {
      const resultado = await findOne({ id });
      if (!resultado) {
        throw new ValidationError('Utilizador não encontrado');
      }

      const updateUser = {};
      if (user.newEmail) {
        if (!isValidEmail(user.newEmail)) {
          throw new ValidationError('O email deve ser válido');
        }
        const userBD = await findOne({ email: user.newEmail });
        if (userBD) throw new ValidationError('Email duplicado na Bd');
        updateUser.email = user.newEmail;
      }

      if (user.newPassword !== user.confirmNewPassword) {
        throw new ValidationError('A nova password não corresponde à confirmação de password');
      }

      if (user.password && user.newPassword) {
        const oldPassword = user.password;
        const { newPassword } = user;
        if (!bcrypt.compareSync(oldPassword, resultado.password)) {
          throw new ValidationError('Password antiga inválida');
        }
        if (!isValidPassword(newPassword)) {
          throw new ValidationError('A password deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um dígito e um caractere especial');
        }
        const newPasswordUser = getPasswdHash(newPassword);
        updateUser.password = newPasswordUser;
      }

      if (user.lastTimeLogin !== undefined) {
        updateUser.lastTimeLogin = user.lastTimeLogin;
      }

      if (user.active !== null) {
        updateUser.active = user.active;
      }

      await app.db('users').where({ id }).update(updateUser);

      const userAtualizado = await findOne({ id });
      return userAtualizado;
    }
    throw new ValidationError('Utilizador não foi atualizado');
  };

  const deleteUser = async (id, userAuths) => {
    const idUser = userAuths.id.toString();
    if (idUser !== id && userAuths.email !== 'admin@uplife.pt') throw new ForbiddenError('Não tem autorização para editar outro utilizador');

    const resultado = await findOne({ id });

    if (!resultado) {
      throw new ValidationError('Utilizador não encontrado');
    }

    const free = await app.services.freelancer.findOne({ userId: id });
    if (free) {
      await app.db('freelancers').where({ userId: id }).delete();
    }

    const cli = await app.services.client.findOne({ userId: id });
    if (cli) {
      await app.db('clients').where({ userId: id }).delete();
    }

    const userDeleted = app.db('users').where({
      id,
    }).del();
    return userDeleted;
  };

  return {
    findAll, save, findOne, update, deleteUser, findOne2,
  };
};
