const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');
const config = require('../../src/config');

const secret = config.privateKey;
let freelancer;
let client;
let insertedScheduling;
let insertedSchedulingComercial;
let insertedSchedulingPosObra;
const mail = `freeSer${Date.now()}@ipca.pt`;

beforeAll(async () => {
  const freelancerRes = await app.services.freelancer.save({
    firstName: 'FreelancerFirstName',
    lastName: 'FreelancerLastName',
    birthdate: '1980-01-01',
    email: mail,
    password: 'A12345a!',
    confirmPassword: 'A12345a!',
  });
  freelancer = {
    userId: freelancerRes.userId,
    freelancerId: freelancerRes.id,
    firstName: freelancerRes.firstName,
    lastName: freelancerRes.lastName,
    birthdate: freelancerRes.birthdate,
  };
  freelancer.token = jwt.encode(freelancer, secret);

  await app.services.freelancerWorkSchedule.addFreelancerSchedule(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      date: '2024-02-12',
      startTime: '04:00:00',
      endTime: '12:00:00',
    },
    freelancer,
  );

  await app.services.freelancerWorkSchedule.addFreelancerSchedule(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      date: '2024-02-12',
      startTime: '13:00:00',
      endTime: '22:00:00',
    },
    freelancer,
  );

  await app.services.freelancerCounty.addFreelancerCountys(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      countyId: 1,
      districtId: 3,
    },
    freelancer,
  );

  await app.services.freelancerCounty.addFreelancerCountys(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      countyId: 13,
      districtId: 3,
    },
    freelancer,
  );

  await app.services.freelancerService.addServices(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      serviceTypeId: 1,
      pricePerHour: 9.5,
    },
    freelancer,
  );

  await app.services.freelancerService.addServices(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      serviceTypeId: 2,
      pricePerHour: 9.5,
    },
    freelancer,
  );

  await app.services.freelancerService.addServices(
    freelancer.freelancerId.toString(),
    {
      freelancerId: freelancer.freelancerId,
      serviceTypeId: 3,
      pricePerHour: 9.5,
    },
    freelancer,
  );

  const res = await app.services.client.save(
    {
      firstName: 'ClientFirstName',
      lastName: 'ClientLastName',
      birthdate: '1980-01-01',
      email: `clienteScheduling${Date.now()}@ipca.pt`,
      password: 'A12345a!',
      confirmPassword: 'A12345a!',
    },
  );
  const {
    id: clientId, userId, firstName, lastName, birthdate, email,
  } = res;

  client = {
    id: userId,
    email,
    clientId,
    firstName,
    lastName,
    birthdate,
  };

  client.token = jwt.encode(client, secret);

  insertedSchedulingComercial = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 2,
      dateScheduling: '2024-02-12',
      startTime: '06:00:00',
      endTime: '08:00:00',
      districtId: 3,
      countyId: 1,
      address: 'Rua Primeiro de Dezembro',
      postalCode: '4700-732',
      scheduleDetails: {
        propertyTypeC: 'escritorio',
        sizeM2C: '100-60',
        bathroomQuantityC: 3,
        changingRoomsC: 'Não',
        windowCleaningC: 'Não',
        otherScenariosC: 'Alguma informação',
      },
    });

  insertedScheduling = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '10:30:00',
      endTime: '12:00:00',
      districtId: 3,
      countyId: 13,
      address: 'Rua 14 de Fevereiro',
      postalCode: '4730-459',
      scheduleDetails: {
        propertyTypeR: 'Casa',
        sizeM2R: 100,
        bathroomQuantityR: 2,
        ironingServicesR: true,
        petFriendlyR: false,
      },
    });

  insertedSchedulingPosObra = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 3,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '13:30:00',
      districtId: 3,
      countyId: 13,
      address: 'Rua 14 de Fevereiro',
      postalCode: '4730-459',
      scheduleDetails: {
        propertyTypeP: 'Casa',
        sizeM2P: 100,
        bathroomQuantityP: 2,
        windowCleaningP: 'Sim',
        otherScenariosP: 'Algumas informações sobre móveis',
        furnitureP: 'Sim',
      },
    });
});

test('Teste Schedulings #1 - inserir agendamento Residencial', async () => {
  const res = await request(app).post('/schedulings/')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '14:15:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyTypeR: 'Casa',
        sizeM2R: 100,
        bathroomQuantityR: 2,
        ironingServicesR: true,
        petFriendlyR: false,
      },
    });
  expect(res.status).toBe(201);
  expect(res.body.clientId).toBe(client.clientId);
  expect(res.body.freelancerId).toBe(freelancer.freelancerId);
  const expectedDate = res.body.dateScheduling;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2024-02-12');
  expect(res.body.startTime).toBe('14:15:00');
  expect(res.body.endTime).toBe('15:00:00');
  expect(res.body.districtId).toBe(3);
  expect(res.body.countyId).toBe(1);
  expect(res.body.address).toBe('R. Mário de Almeida');
  expect(res.body.postalCode).toBe('4700-395');
  expect(res.body.scheduleDetails).toStrictEqual({
    propertyTypeR: 'Casa',
    sizeM2R: 100,
    bathroomQuantityR: 2,
    ironingServicesR: true,
    petFriendlyR: false,
  });
});

test('Teste Schedulings #2 - inserir agendamento Comercial', async () => {
  const res = await request(app).post('/schedulings/')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 2,
      dateScheduling: '2024-02-12',
      startTime: '18:00:00',
      endTime: '19:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyTypeC: 'Escritorio',
        sizeM2C: 100,
        bathroomQuantityC: 2,
        changingRoomsC: true,
        windowCleaningC: false,
        otherScenariosC: 'Alguma informação adicional',
      },
    });
  expect(res.status).toBe(201);
  expect(res.body.clientId).toBe(client.clientId);
  expect(res.body.freelancerId).toBe(freelancer.freelancerId);
  const expectedDate = res.body.dateScheduling;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2024-02-12');
  expect(res.body.startTime).toBe('18:00:00');
  expect(res.body.endTime).toBe('19:00:00');
  expect(res.body.districtId).toBe(3);
  expect(res.body.countyId).toBe(1);
  expect(res.body.address).toBe('R. Mário de Almeida');
  expect(res.body.postalCode).toBe('4700-395');
  expect(res.body.scheduleDetails).toStrictEqual({
    propertyTypeC: 'Escritorio',
    sizeM2C: 100,
    bathroomQuantityC: 2,
    changingRoomsC: true,
    windowCleaningC: false,
    otherScenariosC: 'Alguma informação adicional',
  });
});

test('Teste Schedulings #3 - inserir agendamento Pos obra', async () => {
  const res = await request(app).post('/schedulings/')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 3,
      dateScheduling: '2024-02-12',
      startTime: '15:30:00',
      endTime: '16:30:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyTypeP: 'Casa',
        sizeM2P: 100,
        bathroomQuantityP: 2,
        windowCleaningP: 'Sim',
        otherScenariosP: 'Algumas informações sobre móveis',
        furnitureP: 'Sim',
      },
    });
  expect(res.status).toBe(201);
  expect(res.body.clientId).toBe(client.clientId);
  expect(res.body.freelancerId).toBe(freelancer.freelancerId);
  const expectedDate = res.body.dateScheduling;
  const expectedDateWithoutTime = expectedDate.split('T')[0];
  expect(expectedDateWithoutTime).toBe('2024-02-12');
  expect(res.body.startTime).toBe('15:30:00');
  expect(res.body.endTime).toBe('16:30:00');
  expect(res.body.districtId).toBe(3);
  expect(res.body.countyId).toBe(1);
  expect(res.body.address).toBe('R. Mário de Almeida');
  expect(res.body.postalCode).toBe('4700-395');
  expect(res.body.scheduleDetails).toStrictEqual({
    propertyTypeP: 'Casa',
    sizeM2P: 100,
    bathroomQuantityP: 2,
    windowCleaningP: 'Sim',
    otherScenariosP: 'Algumas informações sobre móveis',
    furnitureP: 'Sim',
  });
});

test('Teste Schedulings #4 - listar Schedulings', async () => {
  return request(app).get('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste Schedulings #5 - listar Schedulings com paginação', async () => {
  return request(app).get('/schedulings?page=2')
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste Schedulings #6 - listar Schedulings pelo cliente', async () => {
  return request(app).get(`/schedulings?clientId=${client.clientId}`)
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste Schedulings #7 - listar Schedulings pelo freelancer', async () => {
  return request(app).get(`/schedulings?freelancerId=${freelancer.freelancerId}`)
    .set('authorization', `bearer ${client.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Teste Schedulings #8 - inserir agendamento a outro cliente', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: 10,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Não tem autorização para inserir agendamentos para outro cliente');
});

test('Teste Schedulings #9 - inserir agendamento sem indicar o cliente', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Cliente é um campo Obrigatório');
});

test('Teste Schedulings #10 - inserir agendamento numa data passada', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2023-12-01',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Não pode fazer um agendamento numa data que já passou');
});

test('Teste Schedulings #11 - inserir agendamento sem indicar o freelancer', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Freelancer é um campo Obrigatório');
});

test('Teste Schedulings #12 - inserir agendamento sem indicar o tipo de serviço', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Tipo de Serviço é um campo Obrigatório');
});

test('Teste Schedulings #13 - inserir agendamento sem indicar o Data do Agendamento', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Data do Agendamento é um campo Obrigatório');
});

test('Teste Schedulings #14 - inserir agendamento sem indicar a Hora de Início', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Hora de Início é um campo Obrigatório');
});

test('Teste Schedulings #15 - inserir agendamento sem indicar a Hora de Fim', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Hora de Fim é um campo Obrigatório');
});

test('Teste Schedulings #16 - inserir agendamento sem indicar o Distrito', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Distrito é um campo Obrigatório');
});

test('Teste Schedulings #17 - inserir agendamento sem indicar o Concelho', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Concelho é um campo Obrigatório');
});

test('Teste Schedulings #18 - inserir agendamento sem indicar a Morada', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Morada é um campo Obrigatório');
});

test('Teste Schedulings #19 - inserir agendamento sem indicar Codigo Postal', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Codigo Postal é um campo Obrigatório');
});

test('Teste Schedulings #20 - inserir agendamento sem indicar os Detalhes do Agendamento', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Detalhes do Agendamento é um campo Obrigatório');
});

test('Teste Schedulings #21 - inserir agendamento a um freelancer que nao existe', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: 3000,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Freelancer não existe');
});

test('Teste Schedulings #22 - inserir agendamento com um tipo de serviço que nao existe', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 3000,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Tipo de serviço não existe');
});

test('Teste Schedulings #23 - inserir agendamento com um concelho que nao existe', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 3000,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Concelho não existe');
});

test('Teste Schedulings #24 - inserir agendamento com um distrito que nao existe', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3000,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyType: 'Casa',
        sizeM2: 100,
        bathroomQuantity: 2,
        ironingServicesR: true,
        petFriendly: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Distrito não existe');
});

test('Teste Schedulings #25 - inserir agendamento com tipo de serviço que o freelancer nao tem', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 6,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 1,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        infant_0_12MonthsQuantity: 2,
        infant_13_24MonthsQuantity: 1,
        child_25Months_4YearsQuantity: 3,
        child_5_8YearsQuantity: 2,
        child_8PlusYearsQuantity: 1,
        specialNeeds: 'None',
        foodAllergyIntolerance: 'None',
        specialCare: 'Yes',
        other: 'Additional information',
        hoursToHire: 8,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer nao tem esse serviço associado');
});

test('Teste Schedulings #26 - inserir agendamento com concelho que freelancer nao trabalha', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '13:00:00',
      endTime: '15:00:00',
      districtId: 3,
      countyId: 3,
      address: 'R. Mário de Almeida',
      postalCode: '4700-395',
      scheduleDetails: {
        propertyTypeR: 'Casa',
        sizeM2R: 100,
        bathroomQuantityR: 2,
        ironingServicesR: true,
        petFriendlyR: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer nao tem esse concelho associado');
});

test('Teste Schedulings #27 - inserir agendamento sem tempo entre moradas', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '08:05:00',
      endTime: '09:00:00',
      districtId: 3,
      countyId: 1,
      address: 'Recta do Feital 73',
      postalCode: '4700-050',
      scheduleDetails: {
        propertyTypeR: 'Casa',
        sizeM2R: 100,
        bathroomQuantityR: 2,
        ironingServicesR: true,
        petFriendlyR: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer nao tem tempo para ir do agendamento anterior para o que esta a agendar.');
});

test('Teste Schedulings #28 - inserir agendamento sem tempo entre moradas', async () => {
  const res = await request(app).post('/schedulings')
    .set('authorization', `bearer ${client.token}`)
    .send({
      clientId: client.clientId,
      freelancerId: freelancer.freelancerId,
      typeServiceId: 1,
      dateScheduling: '2024-02-12',
      startTime: '08:20:00',
      endTime: '10:25:00',
      districtId: 3,
      countyId: 1,
      address: 'R. do Padrão 33',
      postalCode: '4700-565',
      scheduleDetails: {
        propertyTypeR: 'Casa',
        sizeM2R: 100,
        bathroomQuantityR: 2,
        ironingServicesR: true,
        petFriendlyR: false,
      },
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O freelancer nao tempo para ir do agendamento que esta a efectuar para o proximo ja agendado');
});

test('Teste Schedulings #29 -  rota de atualização de agendamento Residencial', async () => {
  const { clientId } = client;
  const scheduleId = insertedScheduling.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        bathroomQuantityR: 3,
        petFriendlyR: 'Sim',
        ironingServicesR: '1',
        propertyTypeR: 'moradia',
        sizeM2R: '40-80',
      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails).toStrictEqual({
    bathroomQuantityR: 3,
    petFriendlyR: 'Sim',
    ironingServicesR: '1',
    propertyTypeR: 'moradia',
    sizeM2R: '40-80',
  });
});

test('Teste Schedulings #30 -  rota de atualização de agendamento Residencial apenas alguns dados', async () => {
  const { clientId } = client;
  const scheduleId = insertedScheduling.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        bathroomQuantityR: 4,
        petFriendlyR: 'Não',
      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails.bathroomQuantityR).toBe(4);
  expect(res.body.scheduleDetails.petFriendlyR).toBe('Não');
});

test('Teste Schedulings #31 - da rota de atualização de agendamento Comercial', async () => {
  const { clientId } = client;
  const scheduleId = insertedSchedulingComercial.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        propertyTypeC: 'Loja',
        sizeM2C: '60',
        bathroomQuantityC: 4,
        changingRoomsC: 'Sim',
        windowCleaningC: 'Sim',
        otherScenariosC: 'Alguma informação adicional sadsadasdsaddsa',
      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails).toStrictEqual({
    propertyTypeC: 'Loja',
    sizeM2C: '60',
    bathroomQuantityC: 4,
    changingRoomsC: 'Sim',
    windowCleaningC: 'Sim',
    otherScenariosC: 'Alguma informação adicional sadsadasdsaddsa',
  });
});

test('Teste Schedulings #32 - da rota de atualização de agendamento Comercial apenas alguns dados', async () => {
  const { clientId } = client;
  const scheduleId = insertedSchedulingComercial.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        propertyTypeC: 'Escritorio',
        sizeM2C: '100-160',

      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails.propertyTypeC).toBe('Escritorio');
  expect(res.body.scheduleDetails.sizeM2C).toBe('100-160');
});

test('Teste Schedulings #33 -  da rota de atualização de agendamento Pos-Obra', async () => {
  const { clientId } = client;
  const scheduleId = insertedSchedulingPosObra.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        propertyTypeP: 'Apartamento',
        sizeM2P: '60',
        bathroomQuantityP: 4,
        windowCleaningP: 'Não',
        otherScenariosP: 'Algumas informações extra',
        furnitureP: 'Não',
      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails).toStrictEqual({
    propertyTypeP: 'Apartamento',
    sizeM2P: '60',
    bathroomQuantityP: 4,
    windowCleaningP: 'Não',
    otherScenariosP: 'Algumas informações extra',
    furnitureP: 'Não',
  });
});

test('Teste Schedulings #34 -  da rota de atualização de agendamento Pos-Obra apenas alguns dados', async () => {
  const { clientId } = client;
  const scheduleId = insertedSchedulingPosObra.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
      scheduleDetails: {
        bathroomQuantityP: 2,
        windowCleaningP: 'Sim',
      },
    });
  expect(res.status).toBe(200);
  expect(res.body.scheduleDetails.bathroomQuantityP).toBe(2);
  expect(res.body.scheduleDetails.windowCleaningP).toBe('Sim');
});

test('Teste Schedulings #35 -  da rota de atualização de agendamento sem schedulingDetails', async () => {
  const { clientId } = client;
  const scheduleId = insertedSchedulingComercial.body.id;
  const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`)
    .send({
    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O agendamento não foi alterado');
});

describe('Teste schedulings #36 - alterar agendamento pós obra sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const { clientId } = client;
    const scheduleId = insertedSchedulingPosObra.body.id;
    const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 3,
        dateScheduling: '2024-02-12',
        startTime: '20:00:00',
        endTime: '21:30:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {

        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2P: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem propertyQuantity', () => testTemplate({ windowCleaningP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem furniture', () => testTemplate({ furnitureP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.6 - Sem otherIssues', () => testTemplate({ otherScenariosP: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

describe('Teste schedulings #37 - alterar agendamento residencial sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const { clientId } = client;
    const scheduleId = insertedScheduling.body.id;
    const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 1,
        dateScheduling: '2024-02-12',
        startTime: '04:30:00',
        endTime: '05:00:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {

        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2R: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem ironingServicesR', () => testTemplate({ ironingServicesR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem petFriendly', () => testTemplate({ petFriendlyR: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

describe('Teste schedulings #38 - alterar agendamento Comercial sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const { clientId } = client;
    const scheduleId = insertedSchedulingComercial.body.id;
    const res = await request(app).put(`/schedulings/${clientId}/${scheduleId}`)
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 2,
        dateScheduling: '2024-02-12',
        startTime: '18:00:00',
        endTime: '19:00:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {

        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2C: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem hasChangingRooms', () => testTemplate({ changingRoomsC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem windowCleaning', () => testTemplate({ windowCleaningC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.6 - Sem otherScenarios', () => testTemplate({ otherScenariosC: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

test('Teste schedulings #39 - Delete scheduling', async () => {
  const { clientId } = client;
  const scheduleId = insertedScheduling.body.id;
  const response = await request(app).delete(`/schedulings/${clientId}/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(204);
});

test('Teste schedulings #40 - Delete scheduling de angendamento que nao existe', async () => {
  const { clientId } = client;
  const response = await request(app).delete(`/schedulings/${clientId}/5000`)
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Agendamento nao econtrado');
});

test('Teste schedulings #41 - Delete scheduling sem autorização id diferente do userAuths', async () => {
  const scheduleId = insertedScheduling.body.id;
  const response = await request(app).delete(`/schedulings/15/${scheduleId}`)
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Não tem autorização para apagar agendamentos de outro cliente');
});

test('Teste schedulings #42 - Delete scheduling sem permissão', async () => {
  const { clientId } = client;
  const response = await request(app).delete(`/schedulings/${clientId}/1`)
    .set('authorization', `bearer ${client.token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Não tem permissão para apagar este agendamento');
});

describe('Teste schedulings #43 - Inserir agendamento residencial sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const res = await request(app).post('/schedulings/')
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 1,
        dateScheduling: '2024-02-12',
        startTime: '04:30:00',
        endTime: '05:00:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {
          propertyTypeR: 'Casa',
          sizeM2R: 100,
          bathroomQuantityR: 2,
          ironingServicesR: true,
          petFriendlyR: false,
          ...newFilter,
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2R: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem ironingServicesR', () => testTemplate({ ironingServicesR: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem petFriendly', () => testTemplate({ petFriendlyR: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

describe('Teste schedulings #44 - Inserir agendamento Comercial sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const res = await request(app).post('/schedulings/')
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 2,
        dateScheduling: '2024-02-12',
        startTime: '18:00:00',
        endTime: '19:00:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {
          propertyTypeC: 'Escritorio',
          sizeM2C: 100,
          bathroomQuantityC: 2,
          changingRoomsC: true,
          windowCleaningC: false,
          otherScenariosC: 'Alguma informação adicional',
          ...newFilter,
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2C: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem hasChangingRooms', () => testTemplate({ changingRoomsC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem windowCleaning', () => testTemplate({ windowCleaningC: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.6 - Sem otherScenarios', () => testTemplate({ otherScenariosC: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

describe('Teste schedulings #45 - Inserir agendamento pós obra sem dados no scheduleDetails', () => {
  const testTemplate = async (newFilter, errorMessage) => {
    const res = await request(app).post('/schedulings/')
      .set('authorization', `bearer ${client.token}`)
      .send({
        clientId: client.clientId,
        freelancerId: freelancer.freelancerId,
        typeServiceId: 3,
        dateScheduling: '2024-02-12',
        startTime: '20:00:00',
        endTime: '21:30:00',
        districtId: 3,
        countyId: 1,
        address: 'R. Mário de Almeida',
        postalCode: '4700-395',
        scheduleDetails: {
          propertyTypeP: 'Casa',
          sizeM2P: 100,
          bathroomQuantityP: 2,
          windowCleaningP: 'Sim',
          otherScenariosP: 'Algumas informações sobre móveis',
          furnitureP: 'Sim',
          ...newFilter,
        },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };

  test('Teste #1.1 - Sem propertyType', () => testTemplate({ propertyTypeP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.2 - Sem sizeM2', () => testTemplate({ sizeM2P: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.3 - Sem bathroomQuantity', () => testTemplate({ bathroomQuantityP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.4 - Sem propertyQuantity', () => testTemplate({ windowCleaningP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.5 - Sem furniture', () => testTemplate({ furnitureP: undefined }, 'Campo obrigatório ausente no agendamento.'));
  test('Teste #1.6 - Sem otherIssues', () => testTemplate({ otherScenariosP: undefined }, 'Campo obrigatório ausente no agendamento.'));
});

test('Teste Schedulings #46 - inserir agendamento Residencial send vazio', async () => {
  const res = await request(app).post('/schedulings/')
    .set('authorization', `bearer ${client.token}`)
    .send({

    });
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('O agendamento não foi registado');
});
