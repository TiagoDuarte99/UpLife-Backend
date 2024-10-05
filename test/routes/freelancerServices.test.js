const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let freelancer;
const mail = `freeServices${Date.now()}@ipca.pt`;

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

test('Teste freelancersServices #1 - listar freelancer Services com paginação', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 5,
      pricePerHour: 9.5,
    });
  return request(app).get(`/freelancerServices/${freelancerId}?page=2`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancersServices #2 - listar freelancer Services pelo tipoServiço', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 1,
      pricePerHour: 9.5,
    });
  return request(app).get(`/freelancerServices/${freelancerId}?page=2&serviceTypeId=3`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancersServices #3 - listar freelancer Services pelo preço', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 6,
      pricePerHour: 9.5,
    });
  return request(app).get(`/freelancerServices/${freelancerId}?page=2&pricePerHour=9.5`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancersServices #4 - Inserir Serviço freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 2,
      pricePerHour: 9.5,
    });
  expect(res.status).toBe(201);
  expect(res.body.freelancerId).toBe(freelancer.freelancerId);
  expect(res.body.serviceTypeId).toBe(2);
  expect(Number(res.body.pricePerHour)).toBe(9.5);
});

test('Teste freelancersServices #5 - Inserir Serviço freelancer sem serviceTypeId', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      pricePerHour: 9.5,
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O id do tipo de serviço é um atributo obrigatório');
});

test('Teste freelancersServices #6 - Inserir Serviço freelancer sem pricePerHour', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 1,
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O preço por hora é um atributo obrigatório');
});

test('Teste freelancersServices #7 - Associar Serviço que nao existe ao freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 3000,
      pricePerHour: 9.5,
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Tipo de serviço não existe');
});

test('Teste freelancersServices #8 - Inserir Serviço a freelancer que não seja o que tem o login efetuado', async () => {
  const res = await request(app).post('/freelancerServices/30')
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 2,
      pricePerHour: 9.5,
    });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Não tem autorização inserir serviço a outro freelancer');
});

test('Teste freelancersServices #9 - Alterar tipo de serviço', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 1;
  const response = await request(app).put(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ serviceTypeId: 3 });
  expect(response.status).toBe(200);
  expect(response.body.serviceTypeId).toBe(3);
});

test('Teste freelancersServices #10 - Tentar alterar tipo de serviço que o utilizador ja tem', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 2;
  const response = await request(app).put(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ serviceTypeId: 3 });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('O freelancer já tem esse serviço associado');
});

test('Teste freelancersServices #11 - Alterar preço hora do tipo de serviço', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 3;
  await request(app).post(`/freelancers/${freelancerId}/services`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      serviceTypeId: 3,
      pricePerHour: 9.5,
    });
  const response = await request(app).put(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ pricePerHour: 10 });
  expect(response.status).toBe(200);
  expect(Number(response.body.pricePerHour)).toBe(10);
});

test('Teste freelancersServices #12 - Alterar para um serviço que nao exista', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 1;
  const response = await request(app).put(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ serviceTypeId: 3000 });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Tipo de serviço não existe');
});

test('Teste freelancersServices #13 - Enviar o send vazio para fazer update', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 1;
  const response = await request(app).put(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Tem de enviar algum dado para ser atualizado');
});

test('Teste freelancersServices #14 - Alterar para um serviço que nao exista', async () => {
  const serviceTypeId = 1;
  const response = await request(app).put(`/freelancerServices/30/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({ serviceTypeId: 7 });
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para editar outro serviços de outro freelancer');
});

test('Teste freelancersServices #15 - listar freelancer Services', async () => {
  const { freelancerId } = freelancer;
  return request(app).get(`/freelancerServices/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancersServices #16 - Delete feelancer service de outro utilizador', async () => {
  const serviceTypeId = 2;
  const response = await request(app).delete(`/freelancerServices/30/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para apagar um serviço a outro freelancer');
});

test('Teste freelancersServices #17 - Delete feelancer service', async () => {
  const { freelancerId } = freelancer;
  const serviceTypeId = 2;
  const response = await request(app).delete(`/freelancerServices/${freelancerId}/${serviceTypeId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(204);
});
