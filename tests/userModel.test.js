const MemoryDB = require('../datastore/MemoryDB');
const UserModel = require('../models/users');

const csvData = `id,email,name,dob,country
1,Siiii@7.co,Cristiano Ronaldo,5/2/1985,PT
2,kame@ame.com,San Goku,15/05/1987,ET
3,gatlin@gu.com,Vagita san,20/12/1980,SY`;

beforeAll(() => {
  MemoryDB.loadData(csvData);
});

describe('MemoryDB & UserModel Tests', () => {
  
  // Test getting a user by ID
  test('should retrieve a user by ID', () => {
    const user = UserModel.getById('1');
    expect(user).not.toBeNull();
    expect(user.name).toBe('Cristiano Ronaldo');
  });

  // Test getting users by country
  test('should retrieve users by country', () => {
    const users = UserModel.getByCountry('PT');
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Cristiano Ronaldo');
  });

  // Test getting users by age
  test('should retrieve users by age', () => {
    const users = UserModel.getByAge('39'); // Bob Lee should be 40 years old
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Cristiano Ronaldo');
  });

  // Test getting users by name (full match)
  test('should retrieve users by full name match', () => {
    const users = UserModel.getByName('Cristiano Ronaldo');
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Cristiano Ronaldo');
  });

   // Test getting users by name (partial match)
   test('should retrieve users by partial name match', () => {
    const users = UserModel.getByName('Cris');
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Cristiano Ronaldo');
  });

  // Test delete user by ID
  test('should delete a user by ID', () => {
    const deleted = UserModel.deleteById('1');
    expect(deleted).toBe(true);

    const userAfterDelete = UserModel.getById('1');
    expect(userAfterDelete).toBeNull();

    const [ageUserArray, countryUserArray, nameUserArray] = [
      UserModel.getByAge('39'),
      UserModel.getByCountry('PT'),
      UserModel.getByName('Cris')
    ];
  
    [ageUserArray, countryUserArray, nameUserArray].forEach((users) => {
      const filteredUsers = users.filter(user => user.id === '1');
      expect(filteredUsers.length).toBe(0); 
    });

  });
});
