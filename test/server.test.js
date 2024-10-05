const supertest = require('supertest');
const jwt = require('jwt-simple');

const request = supertest('http://localhost:3001');
const app = require('../src/app');

const mail = `u${Date.now()}@ipca.pt`;
const secret = 'PalavraSecreta2023';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);
});

test('validar se o servidor responde no porto 3001', () => {
  return request.get('/')
    .set('authorization', `bearer ${user.token}`)
    .then((res) => expect(res.status).toBe(200));
});
