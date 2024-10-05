const request = require('supertest');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

const app = require('../../src/app');
const config = require('../../src/config');

let mail = `u${Date.now()}@ipca.pt`;

const secret = config.privateKey;
let user;
let freelancer1;

beforeAll(async () => {
  const res = await app.services.user.save({
    email: mail, password: 'A12345a!', confirmPassword: 'A12345a!', active: true,
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, secret);

  mail = `u1${Date.now()}@ipca.pt`;
  const res2 = await app.services.freelancer.save({
    firstName: 'FreelancerFirstName',
    lastName: 'FreelancerLastName',
    birthdate: '1980-01-01',
    email: mail,
    password: 'A12345a!',
    confirmPassword: 'A12345a!',
  });
  freelancer1 = { ...res2 };
  freelancer1.token = jwt.encode(freelancer1, secret);
});

test('Teste users #1 - listar Utilizadores 1 pagina', () => {
  return request(app).get('/users')
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

test('Teste users #2 - listar Utilizadores, por pagina exemplo pagina 2', () => {
  const pageToRequest = 2;
  return request(app)
    .get(`/users?page=${pageToRequest}`)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.headers['x-total-count']).toBeDefined();
    });
});

test('Teste users #3 - Inserir Utilizador', () => {
  mail = `u2${Date.now()}@ipca.pt`;
  return request(app).post('/auth/signup/users')
    .send({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.email).toBe(mail);
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Teste users #4 - Guardar a palavra-passe encriptada', async () => {
  const res = await request(app).post('/auth/signup/users')
    .send({ email: `u3${Date.now()}@ipca.pt`, password: 'A12345a!', confirmPassword: 'A12345a!' });
  expect(res.status).toBe(201);
  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBeUndefined();
  expect(userDB.password).not.toBe('A12345a!');
});

test('Teste users #5 - Inserir Utilizador sem email', async () => {
  const result = await request(app).post('/auth/signup/users')
    .send({ password: 'A12345a!', confirmPassword: 'A12345a!' });
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('O email é um atributo obrigatório');
});

test('Teste users #6 - Inserir Utilizador sem password', () => {
  return request(app).post('/auth/signup/users')
    .send({ email: `u4${Date.now()}@ipca.pt`, confirmPassword: 'A12345a!' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password é obrigatória');
    });
});

test('Teste users #7 - Inserir Utilizadores com email duplicado', () => {
  return request(app).post('/auth/signup/users')
    .send({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email duplicado na Bd');
    });
});

test('Teste users #8 - Inserir Utilizadores com password e confirmar password diferentes', () => {
  return request(app).post('/auth/signup/users')
    .send({ email: `u6${Date.now()}@ipca.pt`, password: 'A12345a!', confirmPassword: 'A123sadadsa!' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password não corresponde à confirmação de password.');
    });
});

test('Teste users #9 - Inserir Utilizador com email nao valido', () => {
  return request(app).post('/auth/signup/users')
    .send({ email: 'ABS.ipca.pt', password: 'A12345a!', confirmPassword: 'A12345a!' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O email deve ser válido');
    });
});

test('Teste users #10 - Inserir Utilizador com password que nao compra os requesitos', () => {
  mail = `u${Date.now()}@ipca.pt`;
  return request(app).post('/auth/signup/users')
    .send({ email: `u7${Date.now()}@ipca.pt`, password: 'A12345a', confirmPassword: 'A12345a' })
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A password deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um dígito e um caractere especial');
    });
});

test('Teste users #11 - Alterar ultimo login', async () => {
  const data = new Date();
  const response = await request(app).put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({ lastTimeLogin: data });
  expect(response.status).toBe(200);
  const expectedDate = data.toISOString();
  expect(response.body.lastTimeLogin).toBe(expectedDate);
});

test('Teste users #12 - Alterar estado Active para false (delete pelo put)', async () => {
  const response = await request(app).put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({ active: false });
  expect(response.status).toBe(200);
  expect(response.body.active).toBe(false);
});

test('Teste users #13 - Alterar dados de outro utilizador', async () => {
  const response = await request(app).put('/users/6')
    .set('authorization', `bearer ${user.token}`)
    .send({ active: false });
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para editar outro utilizador');
});

test('Teste users #14 - Alterar password com sucesso', async () => {
  const password = 'A12345a!';
  const newPassword = 'NovaSenha123!';
  const confirmNewPassword = 'NovaSenha123!';
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      password,
      newPassword,
      confirmNewPassword,
    });
  expect(response.status).toBe(200);
  const updatedUser = await request(app)
    .get(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`);
  const isPasswordUpdated = bcrypt.compareSync(newPassword, updatedUser.body.password);
  expect(isPasswordUpdated).toBe(true);
});

test('Teste users #15- Alterar password com password e confirmar password diferentes', async () => {
  const password = 'A12345a!';
  const newPassword = 'NovaSenha123!';
  const confirmNewPassword = 'A123fdfgfdgd!';
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      password,
      newPassword,
      confirmNewPassword,
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('A nova password não corresponde à confirmação de password');
});

test('Teste users #16- Alterar email', async () => {
  const newMail = `abc${Date.now()}@ipca.pt`;
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      newEmail: newMail,
    });
  expect(response.status).toBe(200);
  expect(response.body.email).toBe(newMail);
});

test('Teste users #17- Alterar email com email ja existente', async () => {
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      newEmail: 'admin@uplife.pt',
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Email duplicado na Bd');
});

test('Teste users #18 - Alterar password com password e confirmar password diferentes', async () => {
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      newEmail: 'abc@',
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('O email deve ser válido');
});

test('Teste users #19 - Alterar password, com password antiga errada', async () => {
  const password = 'A12345a!..';
  const confirmNewPassword = 'NovaSenha123!';
  const newPassword = 'NovaSenha123!';
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      password,
      newPassword,
      confirmNewPassword,
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Password antiga inválida');
});

test('Teste users #20 - Alterar password sem comprir com os criterios', async () => {
  const password = 'NovaSenha123!';
  const confirmNewPassword = '12345';
  const newPassword = '12345';
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
      password,
      newPassword,
      confirmNewPassword,
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('A password deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um dígito e um caractere especial');
});

test('Teste users #21 - Alterar user sem enviar dados', async () => {
  const response = await request(app)
    .put(`/users/${user.id}`)
    .set('authorization', `bearer ${user.token}`)
    .send({
    });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Utilizador não foi atualizado');
});

test('Teste users #22 - Delete user', async () => {
  mail = `u8${Date.now()}@ipca.pt`;
  const res = await app.services.user.save({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' });
  const user2 = { ...res[0] };
  user2.token = jwt.encode(user2, secret);
  const response = await request(app).delete(`/users/${user2.id}`)
    .set('authorization', `bearer ${user2.token}`);
  expect(response.status).toBe(204);
});

test('Teste users #23 - Apagar outro utilizador que não é o que tem o token', async () => {
  mail = `u9${Date.now()}@ipca.pt`;
  const res = await app.services.user.save({ email: mail, password: 'A12345a!', confirmPassword: 'A12345a!' });
  const user3 = { ...res[0] };
  user3.token = jwt.encode(user, secret);
  const response = await request(app).delete('/users/6')
    .set('authorization', `bearer ${user3.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para editar outro utilizador');
});
