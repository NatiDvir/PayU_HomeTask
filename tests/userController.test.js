const request = require('supertest');
const app = require('../index'); 
const MemoryDB = require('../datastore/MemoryDB');
const server = require('../index');

const csvData = `id,email,name,dob,country
1,Siiii@7.co,Cristiano Ronaldo,5/2/1985,PT
2,kame@ame.com,San Goku,15/05/1987,ET
3,gatlin@gu.com,Vagita san,20/12/1980,SY`;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  MemoryDB.loadData(csvData);
});

afterAll(() => {
  server.close();
});


describe('User API Tests', () => {
  // Test the GET /users/:id API
  test('should get a user by ID', async () => {
    const response = await request(app).get('/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Cristiano Ronaldo');
  });

  // Test the GET /users?country=PT API
  test('should get users by country ', async () => {
    const response = await request(app).get('/users').query({ country: 'PT' });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Cristiano Ronaldo');
  });

  // Test the GET /users?name=Cristiano API for partial name match
  test('should get users by partial name match', async () => {
    const response = await request(app).get('/users').query({ name: 'Cris' });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Cristiano Ronaldo');
  });

  // Test the GET /users?age=39 API
  test('should get users by age', async () => {
    const response = await request(app).get('/users').query({ age: '39' });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Cristiano Ronaldo');
  });

  // Test the DELETE /users/:id API
  test('should delete a user by ID (DELETE /users/:id)', async () => {
    const deleteResponse = await request(app).delete('/users/1');
    expect(deleteResponse.status).toBe(204); 

    const getResponse = await request(app).get('/users/1');
    expect(getResponse.status).toBe(404); 
  });

  // Test invalid query (GET /users with invalid query)
  test('should return 400 for invalid query', async () => {
    const response = await request(app).get('/users').query({ invalid: 'param' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Only one query param is supported, and it must be one of the following: country, name, email, age'
    );
  });
});
