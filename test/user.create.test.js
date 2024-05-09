const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user';

describe('UC201 Registreren als nieuwe user', () => {
    it('Maak twee geldige gebruikers aan', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Doe',
                emailAdress: 'j.doe@example.com',
                password: 'StrongPass123'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                
                chai.request(server)
                    .post(endpointToTest)
                    .send({
                        firstName: 'Jane',
                        lastName: 'Doe',
                        emailAdress: 'j.doe@example.com',
                        password: 'SecurePass456'
                    })
                    .end((err, res) => {
                        chai.expect(res).to.have.status(200);
                        done();
                    });
            });
    });
});

describe('UC202 Ophalen van alle gebruikers', () => {
    it('Toon alle gebruikers die zijn gemaakt', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.an('array').that.has.lengthOf.at.least(2); // Minstens 2 gebruikers moeten aanwezig zijn
                done();
            });
    });
});

describe('UC204 Ophalen van een gebruiker op basis van ID', () => {
    it('Toon een gebruiker met de juiste ID (ID = 2)', (done) => {
        chai.request(server)
            .get(endpointToTest + '/2')
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('id').equals(2);
                done();
            });
    });
});

describe('UC205 Bijwerken van gebruikersgegevens', () => {
    it('Verander de naam van een gebruiker', (done) => {
        chai.request(server)
            .put(endpointToTest + '/1') // ID van de gebruiker die we willen bijwerken
            .send({
                firstName: 'NewName', // Nieuwe naam
                lastName: 'Doe' // Blijft hetzelfde
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').equals('User updated successfully');
                done();
            });
    });
});

describe('UC206 Verwijderen van een gebruiker', () => {
    it('Verwijder een gebruiker', (done) => {
        chai.request(server)
            .delete(endpointToTest + '/1') // ID van de gebruiker die we willen verwijderen
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').equals('User deleted successfully');
                done();
            });
    });
});