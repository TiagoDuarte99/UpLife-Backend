INSERT INTO schedulings (
  "clientId",
  "freelancerId",
  "typeServiceId",
  "dateScheduling",
  "startTime",
  "endTime",
  "districtId",
  "countyId",
  "address",
  "postalCode",
  "scheduleDetails"
) VALUES (
  1,
  4,
  1,
  '2024-02-12',
  '11:05:00',
  '12:00:00',
  3,
  1,
  'Rua Primeiro de Dezembro',
  '4700-732',
  '{"propertyType": "Casa", "sizeM2": 100, "bathroomQuantity": 2, "ironing": true, "petFriendly": false}'::json
);