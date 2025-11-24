const { validateLogin } = require('../../validators/authValidators');
const express = require('express');
const request = require('supertest');

describe('authValidators - validateLogin', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/test-login', validateLogin, (req, res) => {
      res.json({ success: true, message: 'Validación exitosa' });
    });
  });

  it('debería permitir login con datos válidos', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('debería rechazar email faltante', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Error de validación');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'El correo electrónico es requerido'
        })
      ])
    );
  });

  it('debería rechazar password faltante', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: 'test@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'La contraseña es requerida'
        })
      ])
    );
  });

  it('debería rechazar email inválido', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: 'email-invalido',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Formato de correo electrónico inválido'
        })
      ])
    );
  });

  it('debería normalizar el email', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123'
      });

    expect(response.status).toBe(200);
  });

  it('debería rechazar email vacío', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: '',
        password: 'password123'
      });

    expect(response.status).toBe(400);
  });

  it('debería rechazar password vacía', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: 'test@example.com',
        password: ''
      });

    expect(response.status).toBe(400);
  });

  it('debería rechazar email con espacios', async () => {
    const response = await request(app)
      .post('/test-login')
      .send({
        email: '   ',
        password: 'password123'
      });

    expect(response.status).toBe(400);
  });
});

