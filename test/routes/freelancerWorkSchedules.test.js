const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let freelancer;
let scheduleId;
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

  const scheduleRes = await request(app)
    .post(`/freelancersSchedules/${freelancer.freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      date: '2024-02-12',
      startTime: '08:00:00',
      endTime: '12:00:00',
    });

  scheduleId = scheduleRes.body.id;
});

test('Teste freelancerWorkSchedules #1 - listar horário freelancer', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '08:00:00',
      endTime: '12:00:00',
    });
  return request(app).get(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancerWorkSchedules #2 - listar horário freelancer filtrado pela data', async () => {
  const { freelancerId } = freelancer;
  await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '08:00:00',
      endTime: '12:00:00',
    });
  return request(app).get(`/freelancersSchedules/${freelancerId}?date=2024-02-12`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancerWorkSchedules #3 - listar horário freelancer filtrado pela data hora inicio e fim', async () => {
  const { freelancerId } = freelancer;
  return request(app).get(`/freelancersSchedules/${freelancerId}?date=2024-02-12&startTime=08:00:00&endTime=12:00:`)
    .set('authorization', `bearer ${freelancer.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste freelancerWorkSchedules #4 - Inserir horário freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(201);
  expect(res.body.freelancerId).toBe(freelancerId);
  const expectedDate = res.body.date;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2024-02-12');
  expect(res.body.startTime).toBe('13:00:00');
  expect(res.body.endTime).toBe('17:00:00');
});

test('Teste freelancerWorkSchedules #5 - Inserir horario a outro freelancer', async () => {
  const res = await request(app).post('/freelancersSchedules/10')
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId: 10,
      date: '2024-02-12',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Não tem autorização inserir horario a outro freelancer');
});

test('Teste freelancerWorkSchedules #6 - Inserir horário freelancer data passada', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-01-02',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Não pode adicionar horários a datas passadas');
});

test('Teste freelancerWorkSchedules #7 - Inserir horário freelancer sem freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2024-02-12',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #8 - Inserir horário freelancer sem data', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A data é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #9 - Inserir horário freelancer sem hora de inicio', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de inicio é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #10 - Inserir horário freelancer sem hora de fim', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '13:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de fim é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #11 - Inserir horário freelancer com horaio de inicio > fim', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '17:00:00',
      endTime: '13:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de inico tem de ser menor que a hora de fim');
});

test('Teste freelancerWorkSchedules #12 - Inserir horário freelancer com horarios sobrepostos(hora incio)', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '14:00:00',
      endTime: '18:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Horario sobreposto para essa data');
});

test('Teste freelancerWorkSchedules #13 - Inserir horário freelancer com horarios sobrepostos(hora Fim)', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).post(`/freelancersSchedules/${freelancerId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      freelancerId,
      date: '2024-02-12',
      startTime: '06:00:00',
      endTime: '09:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Horario sobreposto para essa data');
});

test('Teste freelancerWorkSchedules #14 - Atualizar horário freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(200);
  expect(res.body.freelancerId).toBe(freelancerId);
  const expectedDate = res.body.date;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2023-12-30');
  expect(res.body.startTime).toBe('13:00:00');
  expect(res.body.endTime).toBe('17:00:00');
});

test('Teste freelancerWorkSchedules #15 - Atualizar horário freelancer de outro freelancer', async () => {
  const res = await request(app).put(`/freelancersSchedules/900/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Não tem autorização para editar o horario de outro freelancer');
});

test('Teste freelancerWorkSchedules #16 - Atualizar horário freelancer sem data', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A data é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #17 - Atualizar horário freelancer sem hora inicio', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de inicio é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #18 - Atualizar horário freelancer sem hora fim', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '13:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de fim é um atributo obrigatório');
});

test('Teste freelancerWorkSchedules #19 - Atualizar horário freelancer hora inicio > fim', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '17:00:00',
      endTime: '13:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('A hora de inico tem de ser menor que a hora de fim');
});

test('Teste freelancerWorkSchedules #20 - Atualizar horário freelancer hora inicio > fim', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/40`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '13:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer nao tem esse horario');
});

test('Teste freelancerWorkSchedules #21 - Atualizar horário freelancer horarios sobrepostos', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app).put(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`)
    .send({
      date: '2023-12-30',
      startTime: '11:00:00',
      endTime: '17:00:00',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Horario sobreposto para essa data');
});

test('Teste deleteFreelancerSchedule #22 - Deletar um horário de trabalho do freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app)
    .delete(`/freelancersSchedules/${freelancerId}/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`);

  expect(res.status).toBe(204);
});

test('Teste deleteFreelancerSchedule #23 - Deletar um horário de trabalho de outro freelancer', async () => {
  const res = await request(app)
    .delete(`/freelancersSchedules/900/${scheduleId}`)
    .set('authorization', `bearer ${freelancer.token}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Não tem autorização para apagar um horário de trabalho de outro freelancer');
});

test('Teste deleteFreelancerSchedule #24 - Deletar um horário que nao pertence ao freelancer', async () => {
  const { freelancerId } = freelancer;
  const res = await request(app)
    .delete(`/freelancersSchedules/${freelancerId}/30`)
    .set('authorization', `bearer ${freelancer.token}`);

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O utilizador não tem esse horário de trabalho');
});
