const InMemoryDatabase = require('../dtb/inmem-db');
const { isValidEmail, isValidPassword, isValidPhoneNumber } = require('../utils/validators');
const logger = require('../utils/logger');

const db = new InMemoryDatabase();
const db2 = require('../dtb/dbconnection');

// Controllerfunctie voor het registreren van een nieuwe gebruiker (UC-201)
exports.createUser = (req, res, next) => {
    logger.info('Creating user:', req.body);

    // Controleren op ontbrekende velden
    if (!req.body.firstName || !req.body.lastName || !req.body.emailAdress || !req.body.password) {
        return res.status(400).json({ status: 400, message: "Missing fields. Please provide firstName, lastName, emailAdress, and password", data: {} });
    }

    // Controleer of het e-mailadres geldig is
    if (!isValidEmail(req.body.emailAdress)) {
        return res.status(400).json({ status: 400, message: "Invalid email address format. Please provide a valid email address in the format: n.lastname@domain.com", data: {} });
    }

    // Controleer of het wachtwoord geldig is
    if (!isValidPassword(req.body.password)) {
        return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and contain at least one uppercase letter and one digit.", data: {} });
    }

    // Controleer of het telefoonnummer geldig is
    if (req.body.phoneNumber && !isValidPhoneNumber(req.body.phoneNumber)) {
        return res.status(400).json({ status: 400, message: "Invalid phone number format. Please provide a valid phone number starting with 06 and containing 10 digits, optionally separated by a space or hyphen after '06'.", data: {} });
    }

    // Controle op uniek e-mailadres
    db2.getConnection(function (err, connection) {
        if (err) {
            logger.error('Error getting database connection:', err);
            return res.status(500).json({ status: 500, message: "Internal Server Error 1", data: {} });
        }

        connection.query('SELECT * FROM user WHERE emailAdress = ?', req.body.emailAdress, (error, rows) => {
            if (error) {
                connection.release();
                logger.error('Error checking existing user:', error);
                return res.status(500).json({ status: 500, message: "Internal Server Error 2", data: {} });
            }

            if (rows.length > 0) {
                connection.release();
                return res.status(400).json({ status: 400, message: "Email address already exists. Please choose a different one.", data: {} });
            }

            // Toevoegen van nieuwe gebruiker
            const newUser = {
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

            connection.query('INSERT INTO user SET ?', newUser, (err, result) => {
                connection.release();
                if (err) {
                    logger.error('Error creating user:', err);
                    return res.status(500).json({ status: 500, message: "Internal Server Error 3", data: {} });
                }

                newUser.id = result.insertId;
                res.status(201).json({ status: 201, message: "User created successfully", data: newUser });
            });
        });
    });
};

// Controllerfunctie voor het ophalen van alle gebruikers (UC-202)
exports.getAllUsers = (req, res) => {
    logger.debug('Getting all users');

    db2.getConnection(function (err, connection) {
        if (err) {
            logger.error('Error getting database connection:', err);
            return res.status(500).json({ status: 500, message: "Internal Server Error 1", data: {} });
        }

        connection.query('SELECT * FROM user', (error, results) => {
            if (error) {
                logger.error('Error getting all users:', error);
                return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
            }
    
            // Stuur de resultaten terug naar de client
            res.status(200).json({ status: 200, message: "Users retrieved successfully", data: results });
        });
    });
};
// Controllerfunctie voor het ophalen van een gebruiker op basis van ID (UC-204)
exports.getUserById = (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logger.debug('Getting user by ID:', userId);

    db2.getConnection(function (err, connection) {
        if (err) {
            logger.error('Error getting database connection:', err);
            return res.status(500).json({ status: 500, message: "Internal Server Error 1", data: {} });
        }

        connection.query('SELECT * FROM user WHERE id = ?', userId, (error, results) => {
            connection.release();
            if (error) {
                logger.error('Error getting user by ID:', error);
                return res.status(500).json({ status: 500, message: "Internal Server Error 2", data: {} });
            }
    
            if (results.length > 0) {
                res.status(200).json({ status: 200, message: "User retrieved successfully", data: results[0] });
            } else {
                res.status(404).json({ status: 404, message: 'User not found', data: {} });
            }
        });
    });
};


// Controllerfunctie voor het bijwerken van gebruikersgegevens (UC-205)
exports.updateUser = (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logger.info('Updating user:', userId, req.body);
    
    // Haal de bijgewerkte gegevens van de gebruiker uit het verzoek
    const updatedUserData = req.body;

    // Controleer of het e-mailadres geldig is
    if (updatedUserData.emailAdress && !isValidEmail(updatedUserData.emailAdress)) {
        return res.status(400).json({ status: 400, message: "Invalid email address format. Please provide a valid email address in the format: n.lastname@domain.com", data: {} });
    }

    // Controleer of het nieuwe e-mailadres al in gebruik is door een andere gebruiker
    db2.getConnection(function (err, connection) {
        if (err) {
            logger.error('Error getting database connection:', err);
            return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
        }

        connection.query('SELECT * FROM user WHERE emailAdress = ? AND id != ?', [updatedUserData.emailAdress, userId], (error, results) => {
            if (error) {
                connection.release();
                logger.error('Error checking existing user:', error);
                return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
            }

            if (results.length > 0) {
                connection.release();
                return res.status(400).json({ status: 400, message: "Email address already exists for another user. Please choose a different one.", data: {} });
            }

            // Controleer of het wachtwoord geldig is
            if (!isValidPassword(req.body.password)) {
                connection.release();
                return res.status(400).json({ status: 400, message: "Password must be at least 8 characters long and contain at least one uppercase letter and one digit.", data: {} });
            }

            // Controleer of het telefoonnummer geldig is
            if (updatedUserData.phoneNumber && !isValidPhoneNumber(updatedUserData.phoneNumber)) {
                connection.release();
                return res.status(400).json({ status: 400, message: "Invalid phone number format. Please provide a valid phone number starting with 06 and containing 10 digits, optionally separated by a space or hyphen after '06'.", data: {} });
            }

            // Update de gebruiker met de opgegeven ID in de database
            connection.query('UPDATE user SET ? WHERE id = ?', [updatedUserData, userId], (err, result) => {
                connection.release();
                if (err) {
                    logger.error('Error updating user:', err);
                    return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
                }

                if (result.affectedRows > 0) {
                    res.status(200).json({ status: 200, message: "User updated successfully", data: {} });
                } else {
                    res.status(404).json({ status: 404, message: 'User not found', data: {} });
                }
            });
        });
    });
};


// Controllerfunctie voor het verwijderen van een gebruiker (UC-206)
exports.deleteUser = (req, res) => {
    const userId = parseInt(req.params.id); // Converteer de parameter naar een numerieke waarde
    logger.warn('Deleting user:', userId);

    // Verwijder de gebruiker met de opgegeven ID uit de database
    db2.getConnection(function (err, connection) {
        if (err) {
            logger.error('Error getting database connection:', err);
            return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
        }

        connection.query('DELETE FROM user WHERE id = ?', userId, (error, result) => {
            connection.release();
            if (error) {
                logger.error('Error deleting user:', error);
                return res.status(500).json({ status: 500, message: "Internal Server Error", data: {} });
            }

            if (result.affectedRows > 0) {
                res.status(200).json({ status: 200, message: "User deleted successfully", data: {} });
            } else {
                res.status(404).json({ status: 404, message: 'User not found', data: {} });
            }
        });
    });
};
