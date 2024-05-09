const express = require('express');
const InMemoryDatabase = require('./src/dtb/inmem-db');
const app = express();
const db = new InMemoryDatabase();
const port = process.env.PORT || 3000;

app.use(express.json());

// Functie om logberichten af te drukken
function logFunctionCall(funcName, params) {
    // Omzetten van het req.body object naar een JSON-string
    const requestBodyString = JSON.stringify(params[0]);
    console.log(`Function called: ${funcName}(${requestBodyString})`);
}

// Functie om te controleren of een e-mailadres geldig is
function isValidEmail(emailAdress) {
    const emailRegex = /^[a-z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/;
    return emailRegex.test(emailAdress);
}

// Functie om te controleren of een wachtwoord geldig is
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// Functie om te controleren of een telefoonnummer geldig is
function isValidPhoneNumber(phoneNumber) {
    const phoneNumberRegex = /^06[- ]?\d{8}$/;
    return phoneNumberRegex.test(phoneNumber);
}

// Route voor het registreren van een nieuwe gebruiker (UC-201)
app.post('/api/user', (req, res) => {
    logFunctionCall('user', [req.body]);

    // Controleren op ontbrekende velden
    if (!req.body.firstName || !req.body.lastName || !req.body.emailAdress || !req.body.password) {
        return res.status(400).json({ error: "Missing fields. Please provide firstName, lastName, emailAdress, and password" });
    }

    // Controleer of het e-mailadres geldig is
    if (!isValidEmail(req.body.emailAdress)) {
        return res.status(400).json({ error: "Invalid email address format. Please provide a valid email address in the format: n.lastname@domain.com" });
    }

    // Controleer of het wachtwoord geldig is
    if (!isValidPassword(req.body.password)) {
        return res.status(400).json({ error: "Password must be at least 8 characters long and contain at least one uppercase letter and one digit." });
    }

    // Controleer of het telefoonnummer geldig is
    if (req.body.phoneNumber && !isValidPhoneNumber(req.body.phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number format. Please provide a valid phone number starting with 06 and containing 10 digits, optionally separated by a space or hyphen after '06'." });
    }

    // Controle op uniek e-mailadres
    const existingUser = db.getAllUsers().find(user => user.emailAdress === req.body.emailAdress);
    if (existingUser) {
        return res.status(400).json({ error: "Email address already exists. Please choose a different one." });
    }

    // Toevoegen van nieuwe gebruiker
    const newUser = {
        id: db.userIdCounter++, // Gebruik de huidige ID-teller en verhoog deze daarna
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAdress: req.body.emailAdress,
        password: req.body.password,
        isActive: req.body.isActive || true, // Voeg isActive toe, indien opgegeven, anders standaard op true zetten
        street: req.body.street || "", // Voeg straatnaam toe, indien opgegeven, anders leeg laten
        city: req.body.city || "", // Voeg stad toe, indien opgegeven, anders leeg laten    
        phoneNumber: req.body.phoneNumber || "", // Voeg telefoonnummer toe, indien opgegeven, anders leeg laten
        roles: req.body.roles || ["user"] // Voeg rollen toe, indien opgegeven, anders standaard op "user" zetten
    };

    // Voeg de nieuwe gebruiker toe aan de database
    const result = db.createUser(newUser);
    if (result.success) {
        res.status(201).json(newUser);
    } else {
        res.status(400).json({ error: result.error });
    }
});

// Route voor het ophalen van alle gebruikers (UC-202)
app.get('/api/user', (req, res) => {
    logFunctionCall('getUsers', []);
    const users = db.getAllUsers();
    res.status(200).json(users);
});

// Route voor het ophalen van een gebruiker op basis van ID (UC-204)
app.get('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logFunctionCall('getUserById', [userId]); 
    const user = db.getUserById(userId);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Route voor het bijwerken van gebruikersgegevens (UC-205)
app.put('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logFunctionCall('updateUser', [userId, req.body]);
    
    // Haal de bijgewerkte gegevens van de gebruiker uit het verzoek
    const updatedUserData = req.body;
    
    // Controleer of het e-mailadres geldig is
    if (updatedUserData.emailAdress && !isValidEmail(updatedUserData.emailAdress)) {
        return res.status(400).json({ error: "Invalid email address format. Please provide a valid email address in the format: n.lastname@domain.com" });
    }

    // Controleer of het nieuwe e-mailadres al in gebruik is door een andere gebruiker
    const existingUserWithEmail = db.getAllUsers().find(user => user.emailAdress === updatedUserData.emailAdress && user.id !== userId);
    if (existingUserWithEmail) {
        return res.status(400).json({ error: "Email address already exists for another user. Please choose a different one." });
    }

    // Controleer of het wachtwoord geldig is
    if (!isValidPassword(req.body.password)) {
        return res.status(400).json({ error: "Password must be at least 8 characters long and contain at least one uppercase letter and one digit." });
    }

    // Controleer of het telefoonnummer geldig is
    if (updatedUserData.phoneNumber && !isValidPhoneNumber(updatedUserData.phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number format. Please provide a valid phone number starting with 06 and containing 10 digits, optionally separated by a space or hyphen after '06'." });
    }

    // Update de gebruiker met de opgegeven ID in de database
    const result = db.updateUser(userId, updatedUserData);
    
    if (result.success) {
        res.status(200).json({ message: 'User updated successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});


// Route voor het verwijderen van een gebruiker (UC-206)
app.delete('/api/user/:id', (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logFunctionCall('deleteUser', [userId]);
    
    // Verwijder de gebruiker met de opgegeven ID uit de database
    const result = db.deleteUser(userId);
    
    if (result.success) {
        res.status(200).json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app