UPDATE "freelancerServices"
SET "pricePerHour" = 11.00 -- Substitua pelo novo preço por hora desejado
WHERE "freelancerId" = 273 -- Substitua pelo ID do freelancer desejado
  AND "serviceTypeId" = 1; -- Substitua pelo ID do tipo de serviço desejado