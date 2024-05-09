// Functie om te controleren of een e-mailadres geldig is
exports.isValidEmail = (emailAdress) => {
    const emailRegex = /^[a-z]\.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/;
    return emailRegex.test(emailAdress);
}

// Functie om te controleren of een wachtwoord geldig is
exports.isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

// Functie om te controleren of een telefoonnummer geldig is
exports.isValidPhoneNumber = (phoneNumber) => {
    const phoneNumberRegex = /^06[- ]?\d{8}$/;
    return phoneNumberRegex.test(phoneNumber);
}
