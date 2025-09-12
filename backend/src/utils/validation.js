const { validate: validateCPF } = require('cpf-check');

// Validar CPF
const isValidCPF = (cpf) => {
  return validateCPF(cpf);
};

// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar senha (mínimo 6 caracteres)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validar nome (mínimo 2 caracteres)
const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Validar valor monetário
const isValidAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// Validar UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Sanitizar string
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

// Validar dados de registro
const validateRegisterData = (data) => {
  const errors = [];

  if (!isValidName(data.nome)) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!isValidPassword(data.senha)) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (!isValidCPF(data.cpf)) {
    errors.push('CPF inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar dados de login
const validateLoginData = (data) => {
  const errors = [];

  if (!isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.senha) {
    errors.push('Senha é obrigatória');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidCPF,
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidAmount,
  isValidUUID,
  sanitizeString,
  validateRegisterData,
  validateLoginData
};
