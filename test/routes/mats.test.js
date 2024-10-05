const request = require('supertest');

const app = require('../../src/app');

let user;
beforeAll(async () => {
  const response = await request(app)
    .post('/auth/signin')
    .send({ email: 'admin@uplife.pt', password: 'A12345a!', confirmPassword: 'A12345a!' });

  user = response.body.token;
});

test('Teste 1 obeter dados - Media', async () => {
  return request(app).get('/mat/media')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
    });
});

test('Teste 2 obeter dados - moda', async () => {
  return request(app).get('/mat/moda')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
    });
});

test('Teste 3 obeter dados - media', async () => {
  return request(app).get('/mat/mediana')
    .set('authorization', `bearer ${user}`)
    .then((res) => {
      expect(res.status).toBe(200);
    });
});
