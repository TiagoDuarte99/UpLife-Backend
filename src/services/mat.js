/* const ValidationError = require('../errors/validationError');
const ForbiddenError = require('../errors/forbiddenError'); */

module.exports = (app) => {
  const getAveragePriceByServiceType = async () => {
    const data = await app
      .db('freelancerServices')
      .join(
        'serviceTypes',
        'serviceTypes.id',
        '=',
        'freelancerServices.serviceTypeId',
      )
      .select('serviceTypes.name')
      .avg({ media: 'pricePerHour' })
      .groupBy('serviceTypes.name');

    const labels = data.map((item) => `${item.name}`);
    const values = data.map((item) => parseFloat(item.media));

    const result = {
      labels,
      datasets: [
        {
          label: 'Média',
          data: values,
        },
      ],
    };

    return result;
  };

  const getModeByServiceType = async () => {
    const data = await app
      .db('freelancerServices')
      .join(
        'serviceTypes',
        'serviceTypes.id',
        '=',
        'freelancerServices.serviceTypeId',
      )
      .select('serviceTypes.name', 'freelancerServices.pricePerHour')
      .count({ priceCount: 'freelancerServices.pricePerHour' })
      .groupBy('serviceTypes.name', 'freelancerServices.pricePerHour')
      .orderBy('serviceTypes.name')
      .orderBy('priceCount', 'desc');

    // Agrupa os resultados pela coluna 'name'
    const groupedData = data.reduce((result, item) => {
      const serviceName = item.name;
      const newResult = { ...result }; // Cria uma cópia do objeto original
      if (!newResult[serviceName]) {
        newResult[serviceName] = [];
      }
      newResult[serviceName].push(item);
      return newResult;
    }, {});

    // Encontra o preço mais comum para cada serviço
    const modeData = Object.entries(groupedData).map(
      ([serviceName, serviceData]) => {
        const mostCommonPrice = serviceData[0].pricePerHour;
        return { name: serviceName, pricePerHour: mostCommonPrice };
      },
    );

    const labels = modeData.map((item) => `${item.name}`);
    const values = modeData.map((item) => parseFloat(item.pricePerHour));

    const result = {
      labels,
      datasets: [
        {
          label: 'Moda',
          data: values,
        },
      ],
    };

    return result;
  };

  const getMedianByServiceType = async () => {
    const data = await app
      .db('freelancerServices')
      .join(
        'serviceTypes',
        'serviceTypes.id',
        '=',
        'freelancerServices.serviceTypeId',
      )
      .select('serviceTypes.name', 'freelancerServices.pricePerHour')
      .count({ priceCount: 'freelancerServices.pricePerHour' })
      .groupBy('serviceTypes.name', 'freelancerServices.pricePerHour')
      .orderBy('serviceTypes.name')
      .orderBy('priceCount', 'desc');

    // Agrupa os resultados pela coluna 'name'
    const groupedData = data.reduce((result, item) => {
      const serviceName = item.name;
      const newResult = { ...result }; // Cria uma cópia do objeto original
      if (!newResult[serviceName]) {
        newResult[serviceName] = [];
      }
      newResult[serviceName].push(item);
      return newResult;
    }, {});

    // Encontra a mediana para cada serviço
    const medianData = Object.entries(groupedData).map(
      ([serviceName, serviceData]) => {
        const sortedPrices = serviceData
          .map((item) => parseFloat(item.pricePerHour))
          .sort((a, b) => a - b);
        const mid = Math.floor(sortedPrices.length / 2);
        const medianPrice = sortedPrices.length % 2 !== 0
          ? sortedPrices[mid]
          : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
        return { name: serviceName, pricePerHour: medianPrice };
      },
    );

    const labels = medianData.map((item) => `${item.name}`);
    const values = medianData.map((item) => item.pricePerHour);

    const result = {
      labels,
      datasets: [
        {
          label: 'Mediana',
          data: values,
        },
      ],
    };

    return result;
  };

  return {
    getAveragePriceByServiceType,
    getModeByServiceType,
    getMedianByServiceType,
  };
};
