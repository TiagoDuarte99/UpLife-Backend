const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

const expiresIn = Date.now() + (24 * 60 * 60 * 1000);
const config = require('../config');

module.exports = (app) => {
  const router = express.Router();

  router.post('/signin', async (req, res, next) => {
    try {
      if (req.body.email !== null && req.body.password !== null) {
        const user = await app.services.user.findOne({ email: req.body.email });

        if (!user) {
          throw new ValidationError('Autenticação inválida!');
        }
        if (user.active === false) {
          throw new ValidationError('Utilizador Inativado!');
        }

        if (bcrypt.compareSync(req.body.password, user.password)) {
          const payload = {
            id: user.id,
            email: user.email,
          };

          const freelancer = await app.services.freelancer.findOne({ userId: user.id });
          const client = await app.services.client.findOne({ userId: user.id });

          let payloadFinal = { ...payload };
          if (freelancer) {
            payloadFinal = {
              ...payloadFinal,
              freelancerId: freelancer.id,
              firstName: freelancer.firstName,
              lastName: freelancer.lastName,
              address: freelancer.address,
              birthdate: freelancer.birthdate,
              districtId: freelancer.districtId,
              countyId: freelancer.countyId,
              phoneNumber: freelancer.phoneNumber,
              description: freelancer.description,
              photo: freelancer.photo,

            };
          } else if (client) {
            payloadFinal = {
              ...payloadFinal,
              clientId: client.id,
              firstName: client.firstName,
              lastName: client.lastName,
              address: client.address,
              birthdate: client.birthdate,
              districtId: client.districtId,
              countyId: client.countyId,
              phoneNumber: client.phoneNumber,
              photo: client.photo,
            };
          }

          const token = jwt.encode(payloadFinal, config.privateKey, 'HS256', { expiresIn });

          const lastTimeLogin = new Date();

          const rowsAffected = await app.db('users').where({ id: user.id }).update({
            lastTimeLogin,
          });

          if (rowsAffected === 0) {
            throw new ValidationError('Erro ao atualizar a última data de login.');
          }

          res.status(200).json({ token, payload: payloadFinal });
        } else {
          throw new ValidationError('Autenticação inválida!');
        }
      }
      throw new ValidationError('Tem de preencher os dados de login');
    } catch (err) {
      next(err);
    }
  });

  router.post('/signup/freelancers', async (req, res, next) => {
    try {
      const result = await app.services.freelancer.save(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/signup/clients', async (req, res, next) => {
    try {
      const result = await app.services.client.save(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });

  router.post('/signup/users', async (req, res, next) => {
    try {
      const result = await app.services.user.save(req.body);
      return res.status(201).json(result[0]);
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
