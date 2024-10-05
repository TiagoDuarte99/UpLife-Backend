const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const findAllFreelancersSchedule = async (page, filter = {}) => {
    const currentPage = page || 1;
    const pageSize = 10;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    /* const dateNow = new Date();
    const currentDate = dateNow.toISOString().split('T')[0]; */

    const {
      serviceTypeId, countyId, date, startTime, endTime, address, postalCode,
    } = filter;

    if (!serviceTypeId) {
      throw new ValidationError('Tipo de serviço é obrigatório.');
    }
    if (!countyId) {
      throw new ValidationError('Distrito e concelho são obrigatórios.');
    }
    if (!date) {
      throw new ValidationError('A data é obrigatória.');
    }
    /*
    if (date < currentDate) {
      throw new ValidationError('Está a tentar agendar um serviço numa data que já passou');
    } */
    if (!startTime) {
      throw new ValidationError('Hora começo é obrigatória.');
    }
    if (!endTime) {
      throw new ValidationError('Hora fim é obrigatória.');
    }
    if (endTime < startTime) {
      throw new ValidationError('Hora fim não pode ser menor que hora começo.');
    }
    if (!address) {
      throw new ValidationError('Morada é obrigatória.');
    }
    if (!postalCode) {
      throw new ValidationError('Codigo postal é obrigatório.');
    }

    const freelancers = await app.db('freelancers')
      .join('freelancerServices', 'freelancers.id', '=', 'freelancerServices.freelancerId')
      .join('countysFreelancerWork', 'freelancers.id', '=', 'countysFreelancerWork.freelancerId')
      .join('FreelancerWorkSchedules', 'freelancers.id', '=', 'FreelancerWorkSchedules.freelancerId')
      .where((builder) => {
        if (countyId) builder.where('countysFreelancerWork.countyId', countyId);
        if (date) builder.where('FreelancerWorkSchedules.date', date);
        if (startTime && endTime) {
          builder.where('FreelancerWorkSchedules.startTime', '<=', startTime)
            .andWhere('FreelancerWorkSchedules.endTime', '>=', endTime);
        }
        if (serviceTypeId) builder.where('freelancerServices.serviceTypeId', serviceTypeId);
      })
      .distinct()
      .orderBy('freelancers.id')
      .select([
        'freelancers.id',
        'freelancers.firstName',
        'freelancers.lastName',
        'freelancers.photo',
        'freelancers.description',
        'freelancers.birthdate',
        'freelancerServices.serviceTypeId',
        'freelancerServices.pricePerHour',
        'countysFreelancerWork.countyId',
        'countysFreelancerWork.districtId',
        'FreelancerWorkSchedules.date',
        'FreelancerWorkSchedules.startTime',
        'FreelancerWorkSchedules.endTime',
      ]);

    const schedulingResults = await app.db('schedulings')
      .whereIn('freelancerId', freelancers.map((freelancer) => freelancer.id))
      .where('dateScheduling', date)
      .orderBy('freelancerId')
      .orderBy('startTime')
      .select([
        'id',
        'freelancerId',
        'dateScheduling',
        'startTime',
        'endTime',
        'address',
        'postalCode',
      ]);

    const filteredFreelancers = freelancers.filter((freelancer) => {
      // Verifica se há sobreposição com os agendamentos existentes do freelancer atual
      const hasOverlappingScheduling = schedulingResults.some((scheduling) => {
        if (scheduling.freelancerId === freelancer.id) {
          const dataApenas = scheduling.dateScheduling.toISOString().split('T')[0];
          const startTimeExistente = new Date(`${dataApenas}T${scheduling.startTime}`);
          const endTimeExistente = new Date(`${dataApenas}T${scheduling.endTime}`);
          const startTimeFilter = new Date(`${date}T${startTime}`);
          const endTimeFilter = new Date(`${date}T${endTime}`);

          return (
            (startTimeFilter <= endTimeExistente && endTimeFilter >= startTimeExistente)
            || (startTimeExistente <= endTimeFilter && endTimeExistente >= startTimeFilter)
          );
        }
        return false;
      });

      // Retorna true para manter o freelancer no array ou false para removê-lo
      return hasOverlappingScheduling;
    });
    // TODO freelancer2     vai ter nome de filtrarSobreposição

    const freelancers2 = freelancers.filter(
      (freelancer) => !filteredFreelancers.includes(freelancer),
    );

    const unavailableFreelancers = [];

    const promises = freelancers2.map(async (freelancer) => {
      const antesDoInicio = schedulingResults.filter(
        (schedule) => schedule.endTime <= startTime && schedule.freelancerId === freelancer.id,
      );

      const ultimoAgendamentoAntesDoInicio = antesDoInicio[antesDoInicio.length - 1];

      const depoisDoTermino = schedulingResults.filter(
        (schedule) => schedule.startTime >= endTime && schedule.freelancerId === freelancer.id,
      );

      const primeiroAgendamentoAntesDoInicio = depoisDoTermino[0];

      if (ultimoAgendamentoAntesDoInicio) {
        const origem = `${address}, ${postalCode}`;
        const destino = `${ultimoAgendamentoAntesDoInicio.address}, ${ultimoAgendamentoAntesDoInicio.postalCode}`;

        const resAntes = await app.services.scheduling.obterDadosRota(origem, destino);

        if (resAntes) {
          const { duracao } = resAntes;
          const time = await app.services.scheduling.convertDates(
            duracao,
            ultimoAgendamentoAntesDoInicio.endTime,
          );
          if (time > startTime) {
            unavailableFreelancers.push(freelancer);
          }
        }
      }

      if (primeiroAgendamentoAntesDoInicio) {
        const origem = `${address}, ${postalCode}`;
        const destino = `${primeiroAgendamentoAntesDoInicio.address}, ${primeiroAgendamentoAntesDoInicio.postalCode}`;

        const resDepois = await app.services.scheduling.obterDadosRota(destino, origem);

        if (resDepois) {
          const { duracao } = resDepois;
          const time = await app.services.scheduling.convertDates(duracao, endTime);
          if (time > primeiroAgendamentoAntesDoInicio.startTime) {
            unavailableFreelancers.push(freelancer);
          }
        }
      }
    });

    // Aguarde a resolução de todas as Promises antes de prosseguir
    await Promise.all(promises);

    // TODO freelancers3 vai ter nome de nao ter tempo entre viagens
    const freelancers3 = freelancers2.filter((f) => !unavailableFreelancers.includes(f));

    const paginatedFreelancers = freelancers3.slice(startIndex, endIndex);
    const totalResults = freelancers3.length;

    return { paginatedFreelancers, totalResults };
  };

  const findOne = (filter = {}) => {
    return app.db('freelancers').where(filter).first();
  };

  const findOne2 = (filter) => {
    const freelancerId = filter.id;
    return app.db('freelancers')
      .leftJoin('users', 'freelancers.userId', 'users.id')
      .leftJoin('districts', 'freelancers.districtId', 'districts.id')
      .leftJoin('countys', 'freelancers.countyId', 'countys.id')
      .where('freelancers.id', freelancerId)
      .first()
      .select('freelancers.*', 'users.email', 'districts.name as districtName', 'countys.name as countyName');
  };

  const save = async (freelancer) => {
    if (freelancer !== undefined && Object.keys(freelancer).length > 0) {
      if (!freelancer.firstName) throw new ValidationError('O primeiro nome é um atributo obrigatório');
      if (!freelancer.lastName) throw new ValidationError('O último nome é um atributo obrigatório');
      if (!freelancer.birthdate) throw new ValidationError('A data de nascimento é um atributo obrigatório');

      const res = await app.services.user.save(
        {
          email: freelancer.email,
          password: freelancer.password,
          confirmPassword: freelancer.confirmPassword,
        },
      );

      if (!res) throw new ValidationError('Utilizador não foi criado');
      const userId = res[0].id;

      const freelancerInsert = await app.db('freelancers').insert({
        userId,
        firstName: freelancer.firstName,
        lastName: freelancer.lastName,
        birthdate: freelancer.birthdate,
      }, ['id', 'userId', 'firstName', 'lastName', 'birthdate']);
      return freelancerInsert[0];
    }

    throw new ValidationError('Utilizador não foi criado');
  };

  const update = async (id, freelancer, userAuths) => {
    const idFreelancer = userAuths.freelancerId.toString();
    if (idFreelancer !== id) throw new ForbiddenError('Não tem autorização para editar outro utilizador');

    const hasNonNullField = Object.entries(freelancer).some(([key, value]) => key !== 'freelancerId' && value !== null);

    if (hasNonNullField) {
      const newFirstName = freelancer.firstName;
      const newLastName = freelancer.lastName;
      const newDistrictId = freelancer.districtId;
      const newcountyId = freelancer.countyId;
      const newAddress = freelancer.address;
      const newBirthdate = freelancer.birthdate;
      const newPhoneNumber = freelancer.phoneNumber;
      const newPhoto = freelancer.photo;
      const newDescription = freelancer.description;

      await app.db('freelancers').where({ id }).update({
        ...(newFirstName && { firstName: newFirstName }),
        ...(newLastName && { lastName: newLastName }),
        ...(newDistrictId && { districtId: newDistrictId }),
        ...(newcountyId && { countyId: newcountyId }),
        ...(newAddress && { address: newAddress }),
        ...(newBirthdate && { birthdate: newBirthdate }),
        ...(newPhoneNumber && { phoneNumber: newPhoneNumber }),
        ...(newPhoto && { photo: newPhoto }),
        ...(newDescription && { description: newDescription }),
      });

      const userAtualizado = await findOne({ id });
      return userAtualizado;
    }
    throw new ValidationError('Preencha pelo menos um campo antes de atualizar o freelancer');
  };

  const deleteFreelancer = async (id, userAuths) => {
    const idFreelancer = userAuths.freelancerId.toString();
    if (idFreelancer !== id) throw new ForbiddenError('Não tem autorização para eliminar outro freelancer');

    const resultado = await findOne({ id });

    const user = await app.services.user.findOne({ id: resultado.userId });

    let freelancerDeleted = '';
    if (user) {
      freelancerDeleted = await app.db('freelancers').where({ id }).delete();

      if (freelancerDeleted) {
        await app.db('users').where({
          id: resultado.userId,
        }).del();
      }
    }
    return freelancerDeleted;
  };

  return {
    findAllFreelancersSchedule, save, findOne, update, deleteFreelancer, findOne2,
  };
};
