class InMemoryDatabase {
    constructor() {
        this.users = [];
        this.userIdCounter = 0; // Uniek identificatienummer teller
    }

    // Functie om een nieuwe gebruiker toe te voegen
    createUser(newUser) {
        // Controleren op ontbrekende velden
        if (!newUser.firstName || !newUser.lastName || !newUser.emailAdress || !newUser.password) {
            return { success: false, error: "Missing fields. Please provide firstName, lastName, emailAdress, and password" };
        }

        // Controle op uniek e-mailadres
        const existingUser = this.users.find(user => user.emailAdress === newUser.emailAdress);
        if (existingUser) {
            return { success: false, error: "Email address already exists. Please choose a different one." };
        }

        // Automatisch genereren van ID
        newUser.id = this.userIdCounter; // Gebruik de huidige ID-teller en verhoog deze daarna
        this.users.push(newUser);
        return { success: true };
    }

    // Functie om een gebruiker bij te werken op basis van ID
    updateUser(id, updatedUserData) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUserData };
            return { success: true };
        }
        return { success: false, error: "User not found" };
    }

    // Functie om een gebruiker te verwijderen op basis van ID
    deleteUser(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return { success: true };
        }
        return { success: false, error: "User not found" };
    }

    // Functie om alle gebruikers op te halen
    getAllUsers() {
        return this.users;
    }

    // Functie om een gebruiker op te halen op basis van ID
    getUserById(id) {
        const user = this.users.find(user => user.id === id);
        if (user) {
            return user;
        }
        return null;
    }
}

module.exports = InMemoryDatabase;
