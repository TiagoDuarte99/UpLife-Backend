const request = require('supertest');

const app = require('../../src/app');

let county;
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

  const district = await request(app).post('/districts')
    .set('authorization', `bearer ${user}`)
    .send({ name: 'TestDistrict' });

  const resDistrictId = await app.services.district.findOneDistrict({
    id: district.body.id,
  });

  const res = await request(app).post('/countys')
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'TestCounty',
      districtId: resDistrictId.id,
    });

  const resCountyId = await app.services.county.findOneCounty({
    id: res.body.id,
  });

  county = { ...resCountyId };
});

test('Teste 1 findAllCountys - listar concelhos', async () => {
  return request(app).get('/countys')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste 2 findOneCounty - encontrar um concelho', async () => {
  const countyId = county.id;
  return request(app).get(`/countys/${countyId}`)
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('TestCounty');
      expect(res.body.id).toBe(county.id);
      expect(res.body.districtId).toBe(county.districtId);
    });
});

test('Teste 3 saveCounty - salvar um concelho', async () => {
  return request(app).post('/countys')
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'Novo Concelho',
      districtId: county.districtId,
    })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Novo Concelho');
    });
});

test('Teste 4 saveCounty - salvar um concelho serm ser admin', async () => {
  return request(app).post('/countys')
    .set('authorization', `bearer ${freelancer}`)
    .send({
      name: 'Novo Concelho',
      districtId: county.districtId,
    })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização inserir concelhos');
    });
});

test('Teste 5 saveCounty - salvar um concelho', async () => {
  return request(app).post('/countys')
    .set('authorization', `bearer ${user}`)
    .send({
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Concelho não foi guardado');
    });
});

test('Teste 6 saveCounty - salvar um concelho', async () => {
  return request(app).post('/countys')
    .set('authorization', `bearer ${user}`)
    .send({
      districtId: county.districtId,
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O nome do concelho é um atributo obrigatório');
    });
});

test('Teste 7 updateCounty - atualizar um concelho', async () => {
  const countyId = county.id;
  return request(app).put(`/countys/${countyId}`)
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'Concelho Atualizado',
      districtId: 1,
    })
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Concelho Atualizado');
    });
});

test('Teste 8 updateCounty - atualizar um concelho sem ser admin', async () => {
  const countyId = county.id;
  return request(app).put(`/countys/${countyId}`)
    .set('authorization', `bearer ${freelancer}`)
    .send({
      name: 'Concelho Atualizado',
      districtId: 1,
    })
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização alterar concelhos');
    });
});

test('Teste 9 updateCounty - atualizar um concelho', async () => {
  return request(app).put('/countys/3000')
    .set('authorization', `bearer ${user}`)
    .send({
      name: 'Concelho Atualizado',
      districtId: 1,
    })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Concelho não encontrado');
    });
});

test('Teste 10 deleteCounty - excluir um concelho', async () => {
  const countyId = county.id;
  return request(app).delete(`/countys/${countyId}`)
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(204);
    });
});

test('Teste 11 deleteCounty - excluir um concelho', async () => {
  return request(app).delete('/countys/3000')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Concelho não encontrado');
    });
});

test('Teste 12 deleteCounty - excluir um concelho ser ser admin', async () => {
  const countyId = county.id;
  return request(app).delete(`/countys/${countyId}`)
    .set('authorization', `bearer ${freelancer}`)
    .then((res) => {
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Não tem autorização apagar concelhos');
    });
});
