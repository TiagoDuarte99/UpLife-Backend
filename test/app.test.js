const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/app');

const mail = `u${Date.now()}@ipca.pt`;
const secret = 'PalavraSecreta2023';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('Testar se está a resolver na raiz', () => {
  return request(app).get('/')
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
    });
});
