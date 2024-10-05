test('Validar o JEST', () => {
  let number = null;
  expect(number).toBeNull();
  number = 10;
  expect(number).not.toBeNull();
  expect(number).toBe(10);
  expect(number).toEqual(10);
  expect(number).toBeGreaterThan(9);
  expect(number).toBeLessThan(11);
});

test('Validar o Objetos', () => {
  const obj = { name: 'Tiago Duarte', mail: 'tiago_duarte99@hotmial.com' };
  expect(obj).toHaveProperty('name');
  expect(obj).toHaveProperty('name', 'Tiago Duarte');
  expect(obj.name).toBe('Tiago Duarte');

  const obj2 = { name: 'Tiago Duarte', mail: 'tiago_duarte99@hotmial.com' };
  expect(obj).toEqual(obj2);
});
