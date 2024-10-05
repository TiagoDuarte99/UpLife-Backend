const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let user;
let freelancer;
const mail = `serviceTypes${Date.now()}@ipca.pt`;
beforeAll(async () => {
  const response = await request(app)
    .post('/auth/signin')
    .send({ email: 'admin@uplife.pt', password: 'A12345a!', confirmPassword: 'A12345a!' });

  user = response.body.token;

  const res = await app.services.freelancer.save({
    firstName: 'FreelancerFirstName',
    lastName: 'FreelancerLastName',
    birthdate: '1980-01-01',
    email: mail,
    password: 'A12345a!',
    confirmPassword: 'A12345a!',
  });

  freelancer = {
    userId: res.userId,
    email: res.email,
    freelancerId: res.id,
    firstName: res.firstName,
    lastName: res.lastName,
    birthdate: res.birthdate,
  };
  freelancer.token = jwt.encode(freelancer, secret);
});

test('Teste servicesTypes #1 - listar Services Types', async () => {
  return request(app).get('/serviceTypes')
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste servicesTypes #2 - listar um Services Type', async () => {
  return request(app).get('/serviceTypes/')
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      id: 4,
    })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Babysitter');
    });
});

test('Teste servicesTypes #3 - Inserir um Services Type', async () => {
  const nameInsert = `test${Date.now()}`;
  return request(app).post('/serviceTypes')
    .set('authorization', `bearer ${user}`)
    .send({
      name: nameInsert,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(nameInsert);
    });
});

test('Teste servicesTypes #4 - Inserir um Services Type utilizador sem autorização', async () => {
  const nameInsert = `test${Date.now()}`;
  return request(app).post('/serviceTypes')
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      name: nameInsert,
    })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização inserir serviços');
    });
});

test('Teste servicesTypes #5 - Inserir um Services Type sem nome', async () => {
  return request(app).post('/serviceTypes')
    .set('authorization', `bearer ${user}`)
    .send({
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O nome é um atributo obrigatório');
    });
});

test('Teste servicesTypes #6 - Inserir um Services Type repetido', async () => {
  return request(app).post('/serviceTypes')
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'Babysitter',
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Já existe um serviço com esse nome');
    });
});

test('Teste servicesTypes #7 - Alterar um Services Type', async () => {
  const serviceId = 475;
  const nameInsert = `update${Date.now()}`;
  return request(app).put(`/serviceTypes/${serviceId}`)
    .set('authorization', `bearer ${user}`)
    .send({
      name: nameInsert,
    })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(nameInsert);
    });
});

test('Teste servicesTypes #8 - Alterar um Services Type que nao existe', async () => {
  const serviceId = 3000;
  const nameInsert = `update${Date.now()}`;
  return request(app).put(`/serviceTypes/${serviceId}`)
    .set('authorization', `bearer ${user}`)
    .send({
      name: nameInsert,
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Esse serviço nao existe');
    });
});

test('Teste servicesTypes #9 - Alterar um Services Type que nao existe', async () => {
  const serviceId = 475;
  return request(app).put(`/serviceTypes/${serviceId}`)
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'Babysitter',
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Esse serviço já existe');
    });
});

test('Teste servicesTypes #10 - Alterar um Services Type que nao existe', async () => {
  const serviceId = 475;
  return request(app).put(`/serviceTypes/${serviceId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      name: 'Babysitter',
    })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização alterar serviços');
    });
});

test('Teste servicesTypes #11 - Apagar um Services Type', async () => {
  const nameInsert = `test${Date.now()}`;
  const serviceInsert = await request(app).post('/serviceTypes')
    .set('authorization', `bearer ${user}`)
    .send({
      name: nameInsert,
    });
  const serviceId = serviceInsert.body.id;
  return request(app).delete(`/serviceTypes/${serviceId}`)
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Teste servicesTypes #12 - Apagar um Services Type que nao existe', async () => {
  return request(app).delete('/serviceTypes/3000')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Esse serviço nao existe');
    });
});

test('Teste servicesTypes #13 - Apagar um Services Type que nao existe', async () => {
  return request(app).delete('/serviceTypes/3000')
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização apagar serviços');
    });
});
