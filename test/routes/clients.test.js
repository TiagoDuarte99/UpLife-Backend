const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let client;
let mail = `cli${Date.now()}@ipca.pt`;

beforeAll(async () => {
  const res = await app.services.client.save({
    firstName: 'ClientFirstName',
    lastName: 'ClientLastName',
    birthdate: '1980-01-01',
    email: mail,
    password: 'A12345a!',
    confirmPassword: 'A12345a!',
  });
  const {
    id: clientId, userId, firstName, lastName, birthdate, email,
  } = res;

  client = {
    id: userId,
    email,
    clientId,
    firstName,
    lastName,
    birthdate,
  };

  client.token = jwt.encode(client, secret);
});

test('Teste clients #1 - listar clientes pagina 1', () => {
  return request(app).get('/clients')
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

test('Teste clients #2 - listar clientes, por pagina exemplo pagina 2', () => {
  const pageToRequest = 2;
  return request(app)
    .get(`/clients?page=${pageToRequest}`)
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

test('Teste clients #3 - Inserir Cliente', async () => {
  mail = `cli2${Date.now()}@ipca.pt`;
  const res = await request(app).post('/auth/signup/clients')
    .send({
      firstName: 'ClientFirstName',
      lastName: 'ClientLastName',
      birthdate: '1980-01-01',
      email: mail,
      password: 'A12345a!',
      confirmPassword: 'A12345a!',
    });
  expect(res.status).toBe(201);
  expect(res.body.firstName).toBe('ClientFirstName');
  expect(res.body.lastName).toBe('ClientLastName');
  const expectedDate = res.body.birthdate;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('1980-01-01');
});

test('Teste clients #4 - Inserir Client sem firstName', async () => {
  const res = await request(app).post('/auth/signup/clients')
    .send({
      lastName: 'ClientLastName',
      birthdate: '1980-01-01',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O primeiro nome é um atributo obrigatório');
});

test('Teste clients #5 - Inserir Client sem lastName', async () => {
  const res = await request(app).post('/auth/signup/clients')
    .send({
      firstName: 'ClientFirstName',
      birthdate: '1980-01-01',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O último nome é um atributo obrigatório');
});

test('Teste clients #6 - Inserir Client sem birthdate', async () => {
  const res = await request(app).post('/auth/signup/clients')
    .send({
      firstName: 'ClientFirstName',
      lastName: 'ClientLastName',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A data de nascimento é um atributo obrigatório');
});

test('Teste clients #7 - Alterar firstName', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ firstName: 'ABC' });
  expect(response.status).toBe(200);
  expect(response.body.firstName).toBe('ABC');
});

test('Teste clients #8 - Alterar lastName', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ lastName: 'ABC' });
  expect(response.status).toBe(200);
  expect(response.body.lastName).toBe('ABC');
});

test('Teste clients #9 - Alterar districtId', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ districtId: '1' });
  expect(response.status).toBe(200);
  expect(response.body.districtId).toBe(1);
});

test('Teste clients #10 - Alterar concelhotId', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ countyId: 1 });
  expect(response.status).toBe(200);
  expect(response.body.districtId).toBe(1);
});

test('Teste clients #11 - Alterar address', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ address: 'Rua ABC' });
  expect(response.status).toBe(200);
  expect(response.body.address).toBe('Rua ABC');
});

test('Teste clients #12 - Alterar birthdate', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ birthdate: '2000-01-01' });
  expect(response.status).toBe(200);
  const expectedDate = response.body.birthdate;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2000-01-01');
});

test('Teste clients #13 - Alterar phoneNumber', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ phoneNumber: '913781712' });
  expect(response.status).toBe(200);
  expect(response.body.phoneNumber).toBe('913781712');
});

test('Teste clients #14 - Alterar phoneNumber', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId,
      firstName: null,
      lastName: null,
      districtId: null,
      countyId: null,
      address: null,
      birthdate: null,
      phoneNumber: null,
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Preencha pelo menos um campo antes de atualizar o freelancer');
});

test('Teste clients #15 - Alterar photo', async () => {
  const { clientId } = client;
  const response = await request(app).put(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({ photo: 'https://www.rbsdirect.com.br/imagesrc/25273339.jpg?w=700' });
  expect(response.status).toBe(200);
  expect(response.body.photo).toBe('https://www.rbsdirect.com.br/imagesrc/25273339.jpg?w=700');
});

test('Teste clients #16 - Alterar dados de outro cliente', async () => {
  const response = await request(app).put('/clients/69')
    .set('authorization', `bearer ${client.token}`)
    .send({ phoneNumber: '913781712' });
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para editar outro cliente');
});

test('Teste clients #17- Delete a outro client', async () => {
  const response = await request(app).delete('/clients/69')
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para eliminar outro cliente');
});

test('Teste clients #18- Delete client', async () => {
  const { clientId } = client;
  const response = await request(app).delete(`/clients/${clientId}`)
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(204);
});
