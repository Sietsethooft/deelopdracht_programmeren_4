// user.test.js

const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index'); // De server-applicatie
const db = require('../src/dtb/inmem-db'); // De in-memory database

describe('User Management API Tests', () => {
  // UC-201: Registreren van een nieuwe gebruiker
  describe('POST /api/user', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/user')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          emailAdress: 'j.doe@example.com',
          password: 'Password123'
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
    });
  });

  // UC-202: Ophalen van alle gebruikers
  describe('GET /api/user', () => {
    it('should retrieve all users', async () => {
      const res = await request(app)
        .get('/api/user');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // UC-204: Ophalen van een gebruiker op basis van ID
  describe('GET /api/user/:id', () => {
    it('should retrieve a user by ID', async () => {
      const user = db.getAllUsers()[0]; // Haal de eerste gebruiker op uit de database
      const res = await request(app)
        .get(`/api/user/${user.id}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });
  });

  // UC-205: Bijwerken van gebruikersgegevens
  describe('PUT /api/user/:id', () => {
    it('should update a user by ID', async () => {
      const user = db.getAllUsers()[0]; // Haal de eerste gebruiker op uit de database
      const res = await request(app)
        .put(`/api/user/${user.id}`)
        .send({ firstName: 'UpdatedName' });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });
  });

  // UC-206: Verwijderen van een gebruiker op basis van ID
  describe('DELETE /api/user/:id', () => {
    it('should delete a user by ID', async () => {
      const user = db.getAllUsers()[0]; // Haal de eerste gebruiker op uit de database
      const res = await request(app)
        .delete(`/api/user/${user.id}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
    });
  });
});
