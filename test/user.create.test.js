const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user';
var newUserId;

describe('UC201 Registreren als nieuwe user', () => {
    it('Maak een geldige gebruiker aan', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: "Gert",
                lastName: "Verhulst",
                emailAdress: "g.verhulst@example.com",
                password: "StrongPass123"
            })
            .end((err, res) => {
                if (err) return done(err); // Als er een fout is, roep done aan met de fout
                newUserId = res.body.data.id; // ID van de net aangemaakte gebruiker verkrijgen
                chai.expect(res).to.have.status(201);
                chai.expect(res.body).to.have.property('status').equals(201);
                chai.expect(res.body).to.have.property('message').equals('User created successfully');
                chai.expect(res.body).to.have.property('data').that.is.an('object');
                done(); // Roep done aan om aan te geven dat de test is voltooid
            });
    });
});

describe('UC202 Ophalen van alle gebruikers', () => {
    it('Toon alle gebruikers die zijn gemaakt', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').equals('Users retrieved successfully');
                chai.expect(res.body).to.have.property('data').that.is.an('array').that.has.lengthOf.at.least(2); // Minstens 2 gebruikers moeten aanwezig zijn
                done();
            });
    });
});

describe('UC204 Ophalen van een gebruiker op basis van ID', () => {
    it('Toon de nieuwe gebruiker met de juiste ID', (done) => {
        chai.request(server)
            .get(endpointToTest + `/${newUserId}`) // ID van de nieuwe gebruiker (UC201) die we willen ophalen
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').equals('User retrieved successfully');
                chai.expect(res.body).to.have.property('data').that.is.an('object').and.have.property('id').equals(newUserId); // ID moet overeenkomen met nieuwe gebruiker
                done();
            });
    });
});

describe('UC205 Bijwerken van gebruikersgegevens', () => {
    it('Verander de naam van een gebruiker', (done) => {
        chai.request(server)
            .put(endpointToTest + `/${newUserId}`) // ID van de nieuwe gebruiker (UC201) die we willen bijwerken
            .send({
                firstName: "Johnita", // nieuwe naam (John -> Johnita)
                lastName: "Doe",
                emailAdress: "j.doe@example.com",
                password: "StrongPass123"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').equals('User updated successfully');
                chai.expect(res.body).to.have.property('data').that.is.an('object');
                done();
            });
    });
});

describe('UC206 Verwijderen van een gebruiker', () => {
    it('Verwijder een gebruiker', (done) => {
        chai.request(server)
            .delete(endpointToTest + `/${newUserId}`) // ID van de nieuwe gebruiker (UC201) die we willen verwijderen
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').equals('User deleted successfully');
                chai.expect(res.body).to.have.property('data').that.is.an('object');
                done();
            });
    });
});
