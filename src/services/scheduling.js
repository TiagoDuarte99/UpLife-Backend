const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const getOneScheduling = (filter = {}) => {
    return app.db('schedulings').where(filter).first();
  };

  const getOneScheduling2 = async (filter = {}) => {
    const result = await app.db('schedulings')
      .join('clients', 'clients.id', '=', 'schedulings.clientId')
      .join('freelancers', 'freelancers.id', '=', 'schedulings.freelancerId')
      .join('districts', 'districts.id', '=', 'schedulings.districtId')
      .join('countys', 'countys.id', '=', 'schedulings.countyId')
      .join('serviceTypes', 'serviceTypes.id', '=', 'schedulings.typeServiceId')
      .join('freelancerServices', function joinCondition() {
        this.on('freelancerServices.freelancerId', '=', 'freelancers.id')
          .andOn('freelancerServices.serviceTypeId', '=', 'serviceTypes.id');
      })
      .where({ 'schedulings.id': filter.id })
      .first()
      .select(
        'schedulings.*',
        'clients.firstName as clientFirstName',
        'clients.lastName as clientLastName',
        'clients.phoneNumber as clientPhoneNumber',
        'clients.address as clientAddress',
        'freelancers.firstName as freelancerFirstName',
        'freelancers.lastName as freelancerLastName',
        'freelancers.phoneNumber as freelancerPhoneNumber',
        'freelancers.address as freelancerAddress',
        'districts.name as districtName',
        'countys.name as countyName',
        'serviceTypes.name as typeServiceName',
        'freelancerServices.pricePerHour as pricePerHour',
      );

    return result;
  };

  const getSchedulings = async (filter = {}) => {
    const { page } = filter;
    const currentPage = page || 1;
    const pageSize = 10;
    const offset = (currentPage - 1) * pageSize;

    const filterFields = [
      'clientId',
      'freelancerId',
      'typeServiceId',
      'dateScheduling',
      'startTime',
      'endTime',
      'districtId',
      'countyId',
    ];

    const newFilter = {};

    filterFields.forEach((field) => {
      if (filter[field]) {
        newFilter[`schedulings.${field}`] = filter[field];
      }
    });

    const schedulings = await app.db('schedulings')
      .where(newFilter)
      .innerJoin('clients', 'clients.id', '=', 'schedulings.clientId')
      .innerJoin('freelancers', 'freelancers.id', '=', 'schedulings.freelancerId')
      .innerJoin('serviceTypes', 'serviceTypes.id', '=', 'schedulings.typeServiceId')
      .innerJoin('districts', 'districts.id', '=', 'schedulings.districtId')
      .innerJoin('countys', 'countys.id', '=', 'schedulings.countyId')
      .select([
        'schedulings.id',
        'clients.firstName as clientName',
        'freelancers.firstName as freelancerName',
        'serviceTypes.name as serviceTypeName',
        'schedulings.scheduleDetails',
        'schedulings.dateScheduling',
        'schedulings.startTime',
        'schedulings.endTime',
        'districts.name as districtName',
        'countys.name as countyName',
        'schedulings.address',
        'schedulings.postalCode',
      ])
      .orderBy('schedulings.startTime')
      .limit(pageSize)
      .offset(offset);

    return schedulings;
  };

  const getSchedulings2 = async (page, filter = {}) => {
    const currentPage = page || 1;
    const pageSize = 12;
    const offset = (currentPage - 1) * pageSize;

    const {
      clientId, freelancerId, date,
    } = filter;

    const schedulingsTotal = await app.db('schedulings')
      .where((builder) => {
        if (clientId) builder.where('schedulings.clientId', clientId);
        if (freelancerId) builder.where('schedulings.freelancerId', freelancerId);
        if (date) builder.where('schedulings.dateScheduling', date);
      })
      .innerJoin('clients', 'clients.id', '=', 'schedulings.clientId')
      .innerJoin('freelancers', 'freelancers.id', '=', 'schedulings.freelancerId')
      .innerJoin('serviceTypes', 'serviceTypes.id', '=', 'schedulings.typeServiceId')
      .innerJoin('districts', 'districts.id', '=', 'schedulings.districtId')
      .innerJoin('countys', 'countys.id', '=', 'schedulings.countyId')
      .count('* as totalResults')
      .first();

    const { totalResults } = schedulingsTotal;

    const schedulings = await app.db('schedulings')
      .where((builder) => {
        if (clientId) builder.where('schedulings.clientId', clientId);
        if (freelancerId) builder.where('schedulings.freelancerId', freelancerId);
        if (date) builder.where('schedulings.dateScheduling', date);
      })
      .innerJoin('clients', 'clients.id', '=', 'schedulings.clientId')
      .innerJoin('freelancers', 'freelancers.id', '=', 'schedulings.freelancerId')
      .innerJoin('serviceTypes', 'serviceTypes.id', '=', 'schedulings.typeServiceId')
      .innerJoin('districts', 'districts.id', '=', 'schedulings.districtId')
      .innerJoin('countys', 'countys.id', '=', 'schedulings.countyId')
      .join('freelancerServices', function joinCondition() {
        this.on('freelancerServices.freelancerId', '=', 'schedulings.freelancerId')
          .andOn('freelancerServices.serviceTypeId', '=', 'schedulings.typeServiceId');
      })
      .select([
        'schedulings.*',
        'clients.firstName as clientFirstName',
        'clients.lastName as clientLastName',
        'clients.phoneNumber as clientPhoneNumber',
        'clients.address as clientAddress',
        'freelancers.firstName as freelancerFirstName',
        'freelancers.lastName as freelancerLastName',
        'freelancers.phoneNumber as freelancerPhoneNumber',
        'freelancers.address as freelancerAddress',
        'districts.name as districtName',
        'countys.name as countyName',
        'serviceTypes.name as typeServiceName',
        'freelancerServices.pricePerHour as pricePerHour',
      ])
      .orderBy('schedulings.dateScheduling', 'schedulings.startTime')
      .limit(pageSize)
      .offset(offset);
    return { schedulings, totalResults };
  };

  const apiKey = 'AIzaSyBuFKNNk8V9F4z2E2uOqvD2VnPc2EkDhp0';

  const obterDadosRota = async (origem, destino, modo = 'driving') => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origem)}&destination=${encodeURIComponent(destino)}&mode=${modo}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const duracao = data.routes[0].legs[0].duration.value;

        return { duracao };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const convertDates = (duracao, hourScheduling) => {
    const endTimeMinutos = (new Date(`1970-01-01T${hourScheduling}Z`).getUTCHours() * 60)
      + new Date(`1970-01-01T${hourScheduling}Z`).getUTCMinutes();

    const data = new Date(0);
    data.setSeconds(duracao);

    const dataMinutos = Math.floor(data.getTime() / (60 * 1000));

    const novoTempoMinutos = endTimeMinutos + dataMinutos;

    const novoTempoDate = new Date(0);
    novoTempoDate.setMinutes(novoTempoMinutos);

    const novoTempoHoras = novoTempoDate.getUTCHours().toString().padStart(2, '0');
    const novoTempoMinutosStr = novoTempoDate.getUTCMinutes().toString().padStart(2, '0');
    const novoTempoSegundosStr = novoTempoDate.getUTCSeconds().toString().padStart(2, '0');

    const novoTempoFormatado = `${novoTempoHoras}:${novoTempoMinutosStr}:${novoTempoSegundosStr}`;

    return novoTempoFormatado;
  };

  const addScheduling = async (scheduling, userAuths) => {
    if (scheduling !== undefined && Object.keys(scheduling).length > 0) {
      const fieldNames = {
        clientId: 'Cliente',
        freelancerId: 'Freelancer',
        typeServiceId: 'Tipo de Serviço',
        dateScheduling: 'Data do Agendamento',
        startTime: 'Hora de Início',
        endTime: 'Hora de Fim',
        districtId: 'Distrito',
        countyId: 'Concelho',
        address: 'Morada',
        postalCode: 'Codigo Postal',
        scheduleDetails: 'Detalhes do Agendamento',
      };

      const requiredFields = Object.keys(fieldNames);

      requiredFields.forEach((field) => {
        if (!(field in scheduling)) {
          const fieldName = fieldNames[field];
          throw new ValidationError(`${fieldName} é um campo Obrigatório`);
        }
      });

      const date = new Date(scheduling.dateScheduling);

      if (date < Date.now()) {
        throw new ValidationError('Não pode fazer um agendamento numa data que já passou');
      }

      const id = scheduling.clientId;
      const idUser = userAuths.clientId;
      if (idUser !== id) throw new ForbiddenError('Não tem autorização para inserir agendamentos para outro cliente');

      const resultClient = await app.services.client.findOne({
        id: scheduling.clientId,
      });
      if (!resultClient) throw new ValidationError('Cliente não existe');

      const resultFreelancer = await app.services.freelancer.findOne({
        id: scheduling.freelancerId,
      });
      if (!resultFreelancer) throw new ValidationError('Freelancer não existe');

      const resultServiceType = await app.services.serviceType.getOneServices({
        id: scheduling.typeServiceId,
      });
      if (!resultServiceType) throw new ValidationError('Tipo de serviço não existe');

      const resultCountys = await app.services.county.findOneCounty({
        id: scheduling.countyId,
      });
      if (!resultCountys) throw new ValidationError('Concelho não existe');

      const resultDistrict = await app.services.district.findOneDistrict({
        id: scheduling.districtId,
      });
      if (!resultDistrict) throw new ValidationError('Distrito não existe');

      if (scheduling.typeServiceId === 1) {
        if (
          scheduling.scheduleDetails.propertyTypeR === undefined
          || scheduling.scheduleDetails.sizeM2R === undefined
          || scheduling.scheduleDetails.bathroomQuantityR === undefined
          || scheduling.scheduleDetails.ironingServicesR === undefined
          || scheduling.scheduleDetails.petFriendlyR === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
      }

      if (scheduling.typeServiceId === 2) {
        if (
          scheduling.scheduleDetails.propertyTypeC === undefined
          || scheduling.scheduleDetails.sizeM2C === undefined
          || scheduling.scheduleDetails.bathroomQuantityC === undefined
          || scheduling.scheduleDetails.windowCleaningC === undefined
          || scheduling.scheduleDetails.changingRoomsC === undefined
          || scheduling.scheduleDetails.otherScenariosC === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
      }

      if (scheduling.typeServiceId === 3) {
        if (
          scheduling.scheduleDetails.propertyTypeP === undefined
          || scheduling.scheduleDetails.sizeM2P === undefined
          || scheduling.scheduleDetails.bathroomQuantityP === undefined
          || scheduling.scheduleDetails.windowCleaningP === undefined
          || scheduling.scheduleDetails.otherScenariosP === undefined
          || scheduling.scheduleDetails.furnitureP === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
      }

      const freelancerServices = await app.services.freelancerService.getOneService(
        {
          freelancerId: scheduling.freelancerId,
          serviceTypeId: scheduling.typeServiceId,
        },
      );
      if (!freelancerServices) throw new ValidationError('O freelancer nao tem esse serviço associado');

      const freelancerCounty = await app.services.freelancerCounty.getOneFreelancerCounty(
        {
          freelancerId: scheduling.freelancerId,
          countyId: scheduling.countyId,
        },
      );

      if (!freelancerCounty) throw new ValidationError('O freelancer nao tem esse concelho associado');

      const freelancerAvailability = await app.services.freelancerWorkSchedule
        .getFreeSchedules(
          scheduling.freelancerId,
          {
            date: scheduling.dateScheduling,
          },
        );
      if (!freelancerAvailability || freelancerAvailability.length === 0) throw new ValidationError('O freelancer nao tem disponibilidade nessa data');

      const availabilitySchedule = freelancerAvailability.find((schedule) => {
        const dataCompleta = schedule.date;
        const dataApenas = dataCompleta.toISOString().split('T')[0];
        const startTimeExistente = new Date(`${dataApenas}T${schedule.startTime}`);
        const endTimeExistente = new Date(`${dataApenas}T${schedule.endTime}`);
        const startTimeNovo = new Date(`${scheduling.dateScheduling}T${scheduling.startTime}`);
        const endTimeNovo = new Date(`${scheduling.dateScheduling}T${scheduling.endTime}`);

        return (
          dataApenas === scheduling.dateScheduling
          && startTimeExistente <= startTimeNovo
          && endTimeExistente >= endTimeNovo
        );
      });

      if (!availabilitySchedule) throw new ValidationError('O freelancer nao tem esse horário de trabalho');

      const schedulingFreeDate = await getSchedulings(
        {
          freelancerId: scheduling.freelancerId,
          date: scheduling.date,
        },
      );

      const overlappingSchedule = schedulingFreeDate.find((schedule) => {
        return (
          schedule.startTime < scheduling.endTime
          && schedule.endTime > scheduling.startTime
        );
      });

      if (overlappingSchedule) {
        throw new ValidationError('O freelancer já tem esse horario preenchido.');
      }

      const antesDoInicio = schedulingFreeDate.filter(
        (schedule) => schedule.endTime <= scheduling.startTime,
      );

      const ultimoAgendamentoAntesDoInicio = antesDoInicio[antesDoInicio.length - 1];

      const depoisDoTermino = schedulingFreeDate.filter(
        (schedule) => schedule.startTime >= scheduling.endTime,
      );

      const primeiroAgendamentoAntesDoInicio = depoisDoTermino[0];

      if (ultimoAgendamentoAntesDoInicio) {
        const origem = `${scheduling.address}, ${scheduling.postalCode}`;
        const addresse = `${ultimoAgendamentoAntesDoInicio.address}, ${ultimoAgendamentoAntesDoInicio.postalCode}`;

        await obterDadosRota(origem, addresse)
          .then((resultado) => {
            if (resultado) {
              const { duracao } = resultado;
              const time = convertDates(duracao, ultimoAgendamentoAntesDoInicio.endTime);
              if (time > scheduling.startTime) {
                throw new ValidationError('O freelancer nao tem tempo para ir do agendamento anterior para o que esta a agendar.');
              }
            }
          });
      }

      if (primeiroAgendamentoAntesDoInicio) {
        const addresse = `${scheduling.address}, ${scheduling.postalCode}`;
        const origem = `${primeiroAgendamentoAntesDoInicio.address}, ${primeiroAgendamentoAntesDoInicio.postalCode}`;
        await obterDadosRota(origem, addresse)
          .then((resultado) => {
            if (resultado) {
              const { duracao } = resultado;
              const time = convertDates(duracao, scheduling.endTime);
              if (time > primeiroAgendamentoAntesDoInicio.startTime) {
                throw new ValidationError('O freelancer nao tempo para ir do agendamento que esta a efectuar para o proximo ja agendado');
              }
            }
          });
      }

      const insertedScheduling = await app.db('schedulings').insert({
        clientId: scheduling.clientId,
        freelancerId: scheduling.freelancerId,
        typeServiceId: scheduling.typeServiceId,
        scheduleDetails: scheduling.scheduleDetails,
        dateScheduling: scheduling.dateScheduling,
        startTime: scheduling.startTime,
        endTime: scheduling.endTime,
        districtId: scheduling.districtId,
        countyId: scheduling.countyId,
        address: scheduling.address,
        postalCode: scheduling.postalCode,
      }, [
        'id',
        'clientId',
        'freelancerId',
        'typeServiceId',
        'dateScheduling',
        'startTime',
        'endTime',
        'districtId',
        'countyId',
        'address',
        'postalCode',
        'scheduleDetails',
      ]);

      return insertedScheduling[0];
    }

    throw new ValidationError('O agendamento não foi registado');
  };

  const updateScheduling = async ({ clientId, schedulingId }, newScheduling, userAuths) => {
    if (newScheduling !== undefined && Object.keys(newScheduling).length > 0) {
      const idUser = userAuths.clientId.toString();
      if (idUser !== clientId) throw new ForbiddenError('Não tem autorização para alterar agendamentos de outro cliente');

      const scheduling = await getOneScheduling({ id: schedulingId });

      if (!scheduling) {
        throw new ValidationError('Agendamento nao econtrado');
      }

      let newSchedulinglast = {};
      if (scheduling.typeServiceId === 1) {
        if (
          newScheduling.scheduleDetails.propertyTypeR === undefined
          && newScheduling.scheduleDetails.sizeM2R === undefined
          && newScheduling.scheduleDetails.bathroomQuantityR === undefined
          && newScheduling.scheduleDetails.ironingServicesR === undefined
          && newScheduling.scheduleDetails.petFriendlyR === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
        const newPropertyTypeR = newScheduling.scheduleDetails.propertyTypeR
          ?? scheduling.scheduleDetails.propertyTypeR;
        const newSizeM2R = newScheduling.scheduleDetails.sizeM2R
          ?? scheduling.scheduleDetails.sizeM2R;
        const newBathroomQuantityR = newScheduling.scheduleDetails.bathroomQuantityR
          ?? scheduling.scheduleDetails.bathroomQuantityR;
        const newIroningServicesR = newScheduling.scheduleDetails.ironingServicesR
          ?? scheduling.scheduleDetails.ironingServicesR;
        const newPetFriendlyR = newScheduling.scheduleDetails.petFriendlyR
          ?? scheduling.scheduleDetails.petFriendlyR;
        newSchedulinglast = {
          ...(newPropertyTypeR && { propertyTypeR: newPropertyTypeR }),
          ...(newSizeM2R && { sizeM2R: newSizeM2R }),
          ...(newBathroomQuantityR && { bathroomQuantityR: newBathroomQuantityR }),
          ...(newIroningServicesR && { ironingServicesR: newIroningServicesR }),
          ...(newPetFriendlyR && { petFriendlyR: newPetFriendlyR }),
        };
        await app.db('schedulings')
          .where({ id: schedulingId })
          .update({
            scheduleDetails: newSchedulinglast,
          });
      }

      if (scheduling.typeServiceId === 2) {
        if (
          newScheduling.scheduleDetails.propertyTypeC === undefined
          && newScheduling.scheduleDetails.sizeM2C === undefined
          && newScheduling.scheduleDetails.bathroomQuantityC === undefined
          && newScheduling.scheduleDetails.windowCleaningC === undefined
          && newScheduling.scheduleDetails.changingRoomsC === undefined
          && newScheduling.scheduleDetails.otherScenariosC === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
        const newPropertyTypeC = newScheduling.scheduleDetails.propertyTypeC
          ?? scheduling.scheduleDetails.propertyTypeC;
        const newSizeM2C = newScheduling.scheduleDetails.sizeM2C
          ?? scheduling.scheduleDetails.sizeM2C;
        const newBathroomQuantityC = newScheduling.scheduleDetails.bathroomQuantityC
          ?? scheduling.scheduleDetails.bathroomQuantityC;
        const newchangingRoomsC = newScheduling.scheduleDetails.changingRoomsC
          ?? scheduling.scheduleDetails.changingRoomsC;
        const newWindowCleaningC = newScheduling.scheduleDetails.windowCleaningC
          ?? scheduling.scheduleDetails.windowCleaningC;
        const newOtherScenariosC = newScheduling.scheduleDetails.otherScenariosC
          ?? scheduling.scheduleDetails.otherScenariosC;

        newSchedulinglast = {
          ...(newPropertyTypeC && { propertyTypeC: newPropertyTypeC }),
          ...(newSizeM2C && { sizeM2C: newSizeM2C }),
          ...(newBathroomQuantityC && { bathroomQuantityC: newBathroomQuantityC }),
          ...(newchangingRoomsC && { changingRoomsC: newchangingRoomsC }),
          ...(newWindowCleaningC && { windowCleaningC: newWindowCleaningC }),
          ...(newOtherScenariosC && { otherScenariosC: newOtherScenariosC }),
        };
        await app.db('schedulings')
          .where({ id: schedulingId })
          .update({
            scheduleDetails: newSchedulinglast,
          });
      }

      if (scheduling.typeServiceId === 3) {
        if (
          newScheduling.scheduleDetails.propertyTypeP === undefined
          && newScheduling.scheduleDetails.sizeM2P === undefined
          && newScheduling.scheduleDetails.bathroomQuantityP === undefined
          && newScheduling.scheduleDetails.windowCleaningP === undefined
          && newScheduling.scheduleDetails.otherScenariosP === undefined
          && newScheduling.scheduleDetails.furnitureP === undefined
        ) {
          throw new ValidationError('Campo obrigatório ausente no agendamento.');
        }
        const newPropertyTypeP = newScheduling.scheduleDetails.propertyTypeP
          ?? scheduling.scheduleDetails.propertyTypeP;
        const newSizeM2P = newScheduling.scheduleDetails.sizeM2P
          ?? scheduling.scheduleDetails.sizeM2P;
        const newBathroomQuantityP = newScheduling.scheduleDetails.bathroomQuantityP
          ?? scheduling.scheduleDetails.bathroomQuantityP;
        const newFurnitureP = newScheduling.scheduleDetails.furnitureP
          ?? scheduling.scheduleDetails.furnitureP;
        const newWindowCleaningP = newScheduling.scheduleDetails.windowCleaningP
          ?? scheduling.scheduleDetails.windowCleaningP;
        const newOtherScenariosP = newScheduling.scheduleDetails.otherScenariosP
          ?? scheduling.scheduleDetails.otherScenariosP;

        newSchedulinglast = {
          ...(newPropertyTypeP && { propertyTypeP: newPropertyTypeP }),
          ...(newSizeM2P && { sizeM2P: newSizeM2P }),
          ...(newBathroomQuantityP && { bathroomQuantityP: newBathroomQuantityP }),
          ...(newFurnitureP && { furnitureP: newFurnitureP }),
          ...(newWindowCleaningP && { windowCleaningP: newWindowCleaningP }),
          ...(newOtherScenariosP && { otherScenariosP: newOtherScenariosP }),
        };
        await app.db('schedulings')
          .where({ id: schedulingId })
          .update({
            scheduleDetails: newSchedulinglast,
          });
      }

      const updatedData = await app.db('schedulings').where('id', schedulingId).first();

      return updatedData;
    }
    throw new ValidationError('O agendamento não foi alterado');
  };

  // TODO tenho de verificar se vem clientId ou FreelancerId
  const deleteScheduling = async ({ clientId, schedulingId }, userAuths) => {
    const idUser = userAuths.clientId.toString();

    if (idUser !== clientId) throw new ForbiddenError('Não tem autorização para apagar agendamentos de outro cliente');

    const scheduling = await getOneScheduling({ id: schedulingId });

    if (!scheduling) {
      throw new ValidationError('Agendamento nao econtrado');
    }

    if (scheduling.clientId.toString() !== idUser
      && scheduling.freelancerId.toString() !== idUser) {
      throw new ValidationError('Não tem permissão para apagar este agendamento');
    }

    return app.db('schedulings').where({
      id: schedulingId,
    }).del();
  };

  return {
    convertDates,
    obterDadosRota,
    addScheduling,
    getOneScheduling,
    getSchedulings,
    getSchedulings2,
    updateScheduling,
    deleteScheduling,
    getOneScheduling2,
  };
};
