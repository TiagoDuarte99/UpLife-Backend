const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let freelancer;
const mail = `freeSer${Date.now()}@ipca.pt`;

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

test('Teste freelancersCountys #1 - listar freelancer Countys', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 2,
    });
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const result = await request(app).get(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(result.status).toBe(200);
  expect(result.body.length).toBeGreaterThan(0);
});

test('Teste freelancersCountys #2- listar freelancer Countys pelo concelho', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 2,
    });
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const result = await request(app).get(`/freelancerCountys/${freelancerId}?countyId=2`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(result.status).toBe(200);
  expect(result.body.length).toBeGreaterThan(0);
});

test('Teste freelancersCountys #3- listar freelancer Countys pelo freelancer', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 2,
    });
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const result = await request(app).get(`/freelancerCountys/${freelancerId}?freelancerId=44`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(result.status).toBe(200);
  expect(result.body.length).toBeGreaterThan(0);
});

test('Teste freelancersCountys #4- listar freelancer Countys pelo disitrito', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 2,
    });
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const result = await request(app).get(`/freelancerCountys/${freelancerId}?districtId=3`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(result.status).toBe(200);
  expect(result.body.length).toBeGreaterThan(0);
});

test('Teste freelancersCountys #5- listar freelancer Countys pelo distrito e concelho com paginação', async () => {
  const { freelancerId } = freelancer;
  const pageToRequest = 2;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 2,
    });
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const result = await request(app).get(`/freelancerCountys/${freelancerId}?districtId=3&countyId=2&page=${pageToRequest}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(result.status).toBe(200);
  expect(result.body.length).toBeGreaterThan(0);
});

test('Teste freelancersCountys #6 - Inserir freelancer Countys', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 3,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.freelancerId).toBe(freelancer.freelancerId);
      expect(res.body.countyId).toBe(3);
      expect(res.body.districtId).toBe(3);
    });
});

test('Teste freelancersCountys #7 - Inserir freelancer Countys, concelho que nao pertence ao distrito', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 4,
      countyId: 3,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('O concelho nao pertence a esse distrito');
    });
});

test('Teste freelancersCountys #8 - Inserir freelancer Countys sem freelancer', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      districtId: 2,
      countyId: 3000,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('O freelancer é um atributo obrigatório');
    });
});

test('Teste freelancersCountys #9 - Inserir freelancer Countys sem distrito', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      countyId: 3000,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('O distrito é um atributo obrigatório');
    });
});

test('Teste freelancersCountys #10 - Inserir freelancer Countys sem concelho', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 2,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('O concelho é um atributo obrigatório');
    });
});

test('Teste freelancersCountys #11 - Inserir freelancer Countys com concelho que nao existe', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 2,
      countyId: 3000,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Concelho não existe');
    });
});

test('Teste freelancersCountys #12 - Inserir freelancer Countys com distrito que nao existe', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 2000,
      countyId: 3,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Distrito não existe');
    });
});

test('Teste freelancersCountys #13 - Inserir freelancer Countys num freelancer que nao existe', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: 3000,
      districtId: 3,
      countyId: 3,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Freelancer não existe');
    });
});

test('Teste freelancersCountys #14 - Inserir freelancer Countys que ja esta associado ao freelancer', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      districtId: 3,
      countyId: 3,
    })
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Freelancer ja tem esse concelho associado');
    });
});

test('Teste freelancersCountys #15 - Atualizar freelancer Countys', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 4,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 5,
    });
  expect(result.status).toBe(200);
  expect(result.body.freelancerId).toBe(freelancer.freelancerId);
  expect(result.body.countyId).toBe(5);
  expect(result.body.districtId).toBe(3);
});

test('Teste freelancersCountys #16 - Atualizar freelancer Countys sem freelancer', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 4,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      districtId: 3,
      countyId: 5,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O freelancer é um atributo obrigatório');
});

test('Teste freelancersCountys #17 - Atualizar freelancer Countys sem distrito', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 4,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      countyId: 5,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O distrito é um atributo obrigatório');
});

test('Teste freelancersCountys #18 - Atualizar freelancer Countys sem concelho', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 4,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O concelho é um atributo obrigatório');
});

test('Teste freelancersCountys #19 - Atualizar freelancer Countys a um freelancer que nao existe', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 1,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: 3000,
      districtId: 3,
      countyId: 4,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Freelancer não encontrado');
});

test('Teste freelancersCountys #20 - Atualizar freelancer Countys, alterar um concelho que nao esta associado ao mesmo', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 4,
      countyId: 1,
    });
  const countyId = 12;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 4,
      countyId: 2,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Freelancer não tem esse concelho associado');
});

test('Teste freelancersCountys #21 - Atualizar freelancer Countys, concelho nao pertece ao distrito', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 13,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 4,
      countyId: 2,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O concelho nao pertence a esse distrito');
});

test('Teste freelancersCountys #22 - Atualizar freelancer Countys, alterar para um concelho que ja esta associado ao mesmo', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 12,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 13,
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Freelancer já tem o novo concelho associado');
});

test('Teste freelancersCountys #23 - Atualizar freelancer Countys, sem enviar dados', async () => {
  const { freelancerId } = freelancer;
  const insertFreeCounty = await request(app).post(`/freelancerCountys/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      districtId: 3,
      countyId: 12,
    });
  const { countyId } = insertFreeCounty.body;

  const result = await request(app).put(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
    });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Tem de enviar algum dado para ser atualizado');
});

test('Teste freelancersCountys #23 - Delete feelancer county', async () => {
  const { freelancerId } = freelancer;
  const countyId = 5;
  const response = await request(app).delete(`/freelancerCountys/${freelancerId}/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(204);
});

test('Teste freelancersCountys #24 - Delete freelancer county de outro utilizador', async () => {
  const countyId = 5;
  const response = await request(app).delete(`/freelancerCountys/30/${countyId}`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para apagar um concelho a outro freelancer');
});

test('Teste freelancersCountys #25 - Delete freelancer county que nao pertence ao freelancer', async () => {
  const { freelancerId } = freelancer;
  const response = await request(app).delete(`/freelancerCountys/${freelancerId}/20`)
    .set('authorization', `bearer ${freelancer.token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('O freelancer não tem esse concelho associado');
});
