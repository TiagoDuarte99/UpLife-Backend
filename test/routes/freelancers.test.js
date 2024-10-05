const request = require('supertest');
const querystring = require('querystring');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let freelancer;
let mail = `free${Date.now()}@ipca.pt`;

beforeAll(async () => {
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

test('Teste freelancers #1 - listar freelancers pagina 1', () => {
  const filters = {
    serviceTypeId: 1,
    countyId: 1,
    date: '2024-02-12',
    startTime: '10:00:00',
    endTime: '12:00:00',
    address: 'R. da Cachada 45-15',
    postalCode: '4705-297',
  };

  const queryString = querystring.stringify(filters);

  return request(app)
    .get(`/freelancers?${queryString}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

describe('Teste freelancers #2 - listar freelancers sem dados', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const filters = {
      serviceTypeId: 1,
      countyId: 1,
      date: '2024-02-12',
      startTime: '10:00:00',
      endTime: '12:00:00',
      address: 'R. da Cachada 45-15',
      postalCode: '4705-297',
      ...newFilter,
    };

    const queryString = querystring.stringify(filters);

    const res = await request(app)
      .get(`/freelancers?${queryString}`)
      .set('authorization', `bearer ${freelancer.token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };
  test('Teste #1.1 - Sem serviceTypeId', () => testTemplate({ serviceTypeId: null }, 'Tipo de serviço é obrigatório.'));
  test('Teste #1.2 - Sem serviceTypeId', () => testTemplate({ countyId: null }, 'Distrito e concelho são obrigatórios.'));
  test('Teste #1.3 - Sem serviceTypeId', () => testTemplate({ date: null }, 'A data é obrigatória.'));
  test('Teste #1.4 - Sem serviceTypeId', () => testTemplate({ startTime: null }, 'Hora começo é obrigatória.'));
  test('Teste #1.5 - Sem serviceTypeId', () => testTemplate({ endTime: null }, 'Hora fim é obrigatória.'));
  // test('Teste #1.1 - Sem serviceTypeId', () => testTemplate({endTime < startTime},
  // 'Hora fim não pode
  // ser menor que hora começo.'))
  test('Teste #1.6 - Sem serviceTypeId', () => testTemplate({ address: null }, 'Morada é obrigatória.'));
  test('Teste #1.7 - Sem serviceTypeId', () => testTemplate({ postalCode: null }, 'Codigo postal é obrigatório.'));
});

test('Teste freelancers #3 - listar freelancers, por pagina exemplo pagina 2', () => {
  const page = 2;
  const filters = {
    page,
    serviceTypeId: 1,
    countyId: 1,
    date: '2024-02-12',
    startTime: '10:00:00',
    endTime: '12:00:00',
    address: 'R. da Cachada 45-15',
    postalCode: '4705-297',
  };

  const queryString = querystring.stringify(filters);

  return request(app)
    .get(`/freelancers?${queryString}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

test('Teste freelancers #4 - Inserir freelancer', async () => {
  mail = `free2${Date.now()}@ipca.pt`;
  const res = await request(app).post('/auth/signup/freelancers')
    .send({
      firstName: 'FreelancerFirstName',
      lastName: 'FreelancerLastName',
      birthdate: '1980-01-01',
      email: mail,
      password: 'A12345a!',
      confirmPassword: 'A12345a!',
    });
  expect(res.status).toBe(201);
  expect(res.body.firstName).toBe('FreelancerFirstName');
  expect(res.body.lastName).toBe('FreelancerLastName');
  const expectedDate = res.body.birthdate;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('1980-01-01');
});

test('Teste freelancers #5 - Inserir freelancer', async () => {
  mail = `free2${Date.now()}@ipca.pt`;
  const res = await request(app).post('/auth/signup/freelancers')
    .send({
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Utilizador não foi criado');
});

test('Teste freelancers #6 - Inserir Freelancer sem firstName', async () => {
  const res = await request(app).post('/auth/signup/freelancers')
    .send({
      lastName: 'FreelancerLastName',
      birthdate: '1980-01-01',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O primeiro nome é um atributo obrigatório');
});

test('Teste freelancers #7 - Inserir freelancers sem lastName', async () => {
  const res = await request(app).post('/auth/signup/freelancers')
    .send({
      firstName: 'freelancersFirstName',
      birthdate: '1980-01-01',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O último nome é um atributo obrigatório');
});

test('Teste freelancers #8 - Inserir freelancer sem birthdate', async () => {
  const res = await request(app).post('/auth/signup/freelancers')
    .send({
      firstName: 'freelancersFirstName',
      lastName: 'freelancerLastName',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A data de nascimento é um atributo obrigatório');
});

test('Teste freelancers #9 - Alterar firstName', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ firstName: 'ABC' });
  expect(response.status).toBe(200);
  expect(response.body.firstName).toBe('ABC');
});

test('Teste freelancers #10 - Alterar lastName', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ lastName: 'ABC' });
  expect(response.status).toBe(200);
  expect(response.body.lastName).toBe('ABC');
});

test('Teste freelancers #11 - Alterar districtId', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ districtId: 1 });
  expect(response.status).toBe(200);
  expect(response.body.districtId).toBe(1);
});

test('Teste freelancers #12 - Alterar concelhotId', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ countyId: 1 });
  expect(response.status).toBe(200);
  expect(response.body.countyId).toBe(1);
});

test('Teste freelancers #13 - Alterar address', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ address: 'Rua ABC' });
  expect(response.status).toBe(200);
  expect(response.body.address).toBe('Rua ABC');
});

test('Teste freelancers #14 - Alterar birthdate', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ birthdate: '2000-01-01' });
  expect(response.status).toBe(200);
  const expectedDate = response.body.birthdate;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2000-01-01');
});

test('Teste freelancers #15 - Alterar phoneNumber', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ phoneNumber: '123123123' });
  expect(response.status).toBe(200);
  expect(response.body.phoneNumber).toBe('123123123');
});

test('Teste freelancers #16 - Alterar photo', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ photo: 'https://www.rbsdirect.com.br/imagesrc/25273339.jpg?w=700' });
  expect(response.status).toBe(200);
  expect(response.body.photo).toBe('https://www.rbsdirect.com.br/imagesrc/25273339.jpg?w=700');
});

test('Teste freelancers #17 - Alterar Descrição', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ description: 'Eu sou o freelancer XXXXXXXX' });
  expect(response.status).toBe(200);
  expect(response.body.description).toBe('Eu sou o freelancer XXXXXXXX');
});

test('Teste freelancers #18 - Alterar Descrição', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).put(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      firstName: null,
      lastName: null,
      districtId: null,
      countyId: null,
      address: null,
      birthdate: null,
      phoneNumber: null,
      description: null,
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Preencha pelo menos um campo antes de atualizar o freelancer');
});

test('Teste freelancers #19 - Alterar dados de outro Freelancer', async () => {
  const response = await request(app).put('/freelancers/17')
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ description: 'Eu sou o freelancer XXXXXXXX' });
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para editar outro utilizador');
});

test('Teste freelancers #20 - Delete a outro freelancer', async () => {
  const response = await request(app).delete('/freelancers/17')
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para eliminar outro freelancer');
});

test('Teste freelancers #21 - Delete freelancer', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).delete(`/freelancers/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(204);
});
