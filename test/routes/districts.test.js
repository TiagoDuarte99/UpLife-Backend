const request = require('supertest');
const app = require('../../src/app');

let district;
let user;
let freelancer;
beforeAll(async () => {
  const response = await request(app)
    .post('/auth/signin')
    .send({ email: 'admin@uplife.pt', password: 'A12345a!', confirmPassword: 'A12345a!' });

  user = response.body.token;

  const responseFree = await request(app)
    .post('/auth/signin')
    .send({ email: 'freeSer1704565535612@ipca.pt', password: 'A12345a!', confirmPassword: 'A12345a!' });

  freelancer = responseFree.body.token;

  await request(app).post('/districts')
    .set('authorization', `bearer ${user}`)
    .send({ name: 'Novo Distrito' });

  const resDistrictId = await app.services.district.findOneDistrict({
    name: 'TestDistrict',
  });
  district = resDistrictId;
});

test('Teste 1 findAllDistricts - listar distritos', async () => {
  return request(app).get('/districts')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste 2 findOneDistrict - encontrar um distrito', async () => {
  const districtId = district.id;
  return request(app).get(`/districts/${districtId}`)
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TestDistrict');
    });
});

test('Teste 3 saveDistrict - salvar um distrito', async () => {
  return request(app).post('/districts')
    .set('authorization', `bearer ${user}`)
    .send({ name: 'Novo Distrito' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Novo Distrito');
    });
});

test('Teste 4 saveDistrict - salvar um distrito sem ser o admin', async () => {
  return request(app).post('/districts')
    .set('authorization', `bearer ${freelancer}`)
    .send({ name: 'Novo Distrito' })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização inserir distritos');
    });
});

test('Teste 5 saveDistrict - guardar um distrito sem enviar dados', async () => {
  return request(app).post('/districts')
    .set('authorization', `bearer ${user}`)
    .send({})
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O distrito não foi inserido');
    });
});

test('Teste 6 updateDistrict - atualizar um distrito', async () => {
  const districtId = district.id;
  return request(app).put(`/districts/${districtId}`)
    .set('authorization', `bearer ${user}`)
    .send({ name: 'Distrito Atualizado' })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Distrito Atualizado');
    });
});

test('Teste 7 updateDistrict - atualizar um distrito', async () => {
  return request(app).put('/districts/3000')
    .set('authorization', `bearer ${user}`)
    .send({ name: 'Distrito Atualizado' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Distrito não encontrado');
    });
});

test('Teste 8 updateDistrict - atualizar um distrito sem ser o admin', async () => {
  const districtId = district.id;
  return request(app).put(`/districts/${districtId}`)
    .set('authorization', `bearer ${freelancer}`)
    .send({ name: 'Distrito Atualizado' })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização alterar distritos');
    });
});

test('Teste 9 deleteDistrict - excluir um distrito', async () => {
  const districtId = district.id;
  return request(app).delete(`/districts/${districtId}`)
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Teste 10 deleteDistrict - excluir um distrito', async () => {
  return request(app).delete('/districts/3000')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Distrito não encontrado');
    });
});

test('Teste 11 deleteDistrict - excluir um distrito sem ser o admin', async () => {
  const districtId = district.id;
  return request(app).delete(`/districts/${districtId}`)
    .set('authorization', `bearer ${freelancer}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização apagar distritos');
    });
});
