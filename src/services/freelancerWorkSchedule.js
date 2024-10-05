const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError');

module.exports = (app) => {
  const getOneFreelancerSchedule = (filter = {}) => {
    return app.db('FreelancerWorkSchedules').where(filter).first();
  };

  const getFreeSchedules = async (id, filter = {}) => {
    const {
      day, month, year, ...otherFilter
    } = filter;
    let query = app.db('FreelancerWorkSchedules').where({ freelancerId: id, ...otherFilter });

    if (day !== undefined) {
      query = query.whereRaw('EXTRACT(DAY FROM "date") = ?', [day]);
    }

    if (month !== undefined && year !== undefined) {
      query = query.whereRaw('EXTRACT(MONTH FROM "date") = ?', [month]);
      query = query.whereRaw('EXTRACT(YEAR FROM "date") = ?', [year]);
    }

    const freelancerSchedules = await query
      .orderBy('date')
      .orderBy('startTime')
      .select([
        'FreelancerWorkSchedules.freelancerId',
        'FreelancerWorkSchedules.date',
        'FreelancerWorkSchedules.startTime',
        'FreelancerWorkSchedules.endTime',
        'FreelancerWorkSchedules.id',
      ]);

    return freelancerSchedules;
  };

  const addFreelancerSchedule = async (freelancerId, freelancerSchedule, userAuths) => {
    const id = freelancerId;
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização inserir horario a outro freelancer');
    if (freelancerSchedule) {
      if (!freelancerSchedule.freelancerId) throw new ValidationError('O freelancer é um atributo obrigatório');// TODO tirar??
      if (!freelancerSchedule.date) throw new ValidationError('A data é um atributo obrigatório');
      if (!freelancerSchedule.startTime) throw new ValidationError('A hora de inicio é um atributo obrigatório');
      if (!freelancerSchedule.endTime) throw new ValidationError('A hora de fim é um atributo obrigatório');
      if (freelancerSchedule.startTime >= freelancerSchedule.endTime) {
        throw new ValidationError('A hora de inico tem de ser menor que a hora de fim');
      }
      const date = new Date(freelancerSchedule.date);

      if (date < Date.now()) {
        throw new ValidationError('Não pode adicionar horários a datas passadas');
      }

      const freelancerSchedules = await getFreeSchedules(
        id,
        {
          date: freelancerSchedule.date,
        },
      );

      const overlappingSchedule = freelancerSchedules.find((schedule) => {
        const dataCompleta = schedule.date;
        const dataApenas = dataCompleta.toISOString().split('T')[0];
        return (
          dataApenas === freelancerSchedule.date
          && schedule.startTime < freelancerSchedule.endTime
          && schedule.endTime > freelancerSchedule.startTime
        );
      });

      if (overlappingSchedule) {
        throw new ValidationError('Horario sobreposto para essa data');
      }

      const insertedFreelancerSchedule = await app.db('FreelancerWorkSchedules').insert({
        freelancerId: freelancerSchedule.freelancerId,
        date: freelancerSchedule.date,
        startTime: freelancerSchedule.startTime,
        endTime: freelancerSchedule.endTime,
      }, ['id', 'freelancerId', 'date', 'startTime', 'endTime']);

      return insertedFreelancerSchedule[0];
    }
    throw new ValidationError('O concelho não foi atribuído ao freelancer');
  };

  const updateFreelancerSchedule = async (
    { freelancerId: id, scheduleId },
    freelancerSchedule,
    userAuths,
  ) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para editar o horario de outro freelancer');

    if (freelancerSchedule !== undefined && Object.keys(freelancerSchedule).length > 0) {
      if (!freelancerSchedule.date) throw new ValidationError('A data é um atributo obrigatório');
      if (!freelancerSchedule.startTime) throw new ValidationError('A hora de inicio é um atributo obrigatório');
      if (!freelancerSchedule.endTime) throw new ValidationError('A hora de fim é um atributo obrigatório');
      if (freelancerSchedule.startTime > freelancerSchedule.endTime) {
        throw new ValidationError('A hora de inico tem de ser menor que a hora de fim');
      }

      const foundSchedule = await getOneFreelancerSchedule({
        id: scheduleId,
        freelancerId: id,
      });

      if (!foundSchedule) throw new ValidationError('O freelancer nao tem esse horario');

      const freelancerSchedules = await getFreeSchedules(
        id,
        {
          date: freelancerSchedule.date,
        },
      );

      const overlappingSchedule = freelancerSchedules.find((schedule) => {
        const dataCompleta = schedule.date;
        const dataApenas = dataCompleta.toISOString().split('T')[0];
        return (
          dataApenas === freelancerSchedule.date
          && schedule.startTime < freelancerSchedule.endTime
          && schedule.endTime > freelancerSchedule.startTime
        );
      });

      if (overlappingSchedule) {
        throw new ValidationError('Horario sobreposto para essa data');
      }

      const newDate = freelancerSchedule.date;
      const newStartTime = freelancerSchedule.startTime;
      const newEndTime = freelancerSchedule.endTime;

      await app.db('FreelancerWorkSchedules').where({
        id: scheduleId,
      }).update({
        ...(newDate && { date: newDate }),
        ...(newStartTime && { startTime: newStartTime }),
        ...(newEndTime && { endTime: newEndTime }),
      });

      const freelancerScheduleUpdated = await getOneFreelancerSchedule({
        id: scheduleId,
      });

      return freelancerScheduleUpdated;
    }
    throw new ValidationError('Tem de enviar algum dado para ser atualizado');
  };

  const deleteFreelancerSchedule = async ({ freelancerId: id, scheduleId }, userAuths) => {
    const idUser = userAuths.freelancerId.toString();
    if (idUser !== id) throw new ForbiddenError('Não tem autorização para apagar um horário de trabalho de outro freelancer');

    if (id && scheduleId) {
      const freelancerSchedule = await getOneFreelancerSchedule({
        id: scheduleId,
        freelancerId: id,
      });

      if (!freelancerSchedule) {
        throw new ValidationError('O utilizador não tem esse horário de trabalho');
      }

      return app.db('FreelancerWorkSchedules').where({
        id: scheduleId,
        freelancerId: id,
      }).del();
    }

    throw new ValidationError('Tem de enviar algum dado para ser apagado');
  };

  return {
    addFreelancerSchedule,
    getOneFreelancerSchedule,
    getFreeSchedules,
    updateFreelancerSchedule,
    deleteFreelancerSchedule,
  };
};
