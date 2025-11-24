const {
  validateCreateUser,
  validateUpdateUser,
  validateGetUsers,
  validateGetUserById,
  validateDeleteUser
} = require('../../validators/userValidators');
const express = require('express');
const request = require('supertest');

describe('userValidators', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validateCreateUser', () => {
    beforeEach(() => {
      app.post('/test-create-user', validateCreateUser, (req, res) => {
        res.json({ success: true });
      });
    });

    it('debería permitir crear usuario con datos válidos', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          name: 'Usuario Test',
          email: 'test@example.com',
          password: 'password123',
          role: 'usuario'
        });

      expect(response.status).toBe(200);
    });

    it('debería rechazar nombre faltante', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'El nombre es requerido'
          })
        ])
      );
    });

    it('debería rechazar nombre muy corto', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          name: 'A',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('debería rechazar password muy corta', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          name: 'Usuario Test',
          email: 'test@example.com',
          password: '12345'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'La contraseña debe tener al menos 6 caracteres'
          })
        ])
      );
    });

    it('debería rechazar rol inválido', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          name: 'Usuario Test',
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid-role'
        });

      expect(response.status).toBe(400);
    });

    it('debería permitir active opcional', async () => {
      const response = await request(app)
        .post('/test-create-user')
        .send({
          name: 'Usuario Test',
          email: 'test@example.com',
          password: 'password123',
          active: true
        });

      expect(response.status).toBe(200);
    });
  });

  describe('validateUpdateUser', () => {
    beforeEach(() => {
      app.put('/test-update-user/:id', validateUpdateUser, (req, res) => {
        res.json({ success: true });
      });
    });

    it('debería permitir actualizar usuario con datos válidos', async () => {
      const response = await request(app)
        .put('/test-update-user/1')
        .send({
          name: 'Nombre Actualizado'
        });

      expect(response.status).toBe(200);
    });

    it('debería rechazar ID inválido', async () => {
      const response = await request(app)
        .put('/test-update-user/invalid')
        .send({
          name: 'Nombre'
        });

      expect(response.status).toBe(400);
    });

    it('debería rechazar nombre muy corto en actualización', async () => {
      const response = await request(app)
        .put('/test-update-user/1')
        .send({
          name: 'A'
        });

      expect(response.status).toBe(400);
    });

    it('debería permitir campos opcionales', async () => {
      const response = await request(app)
        .put('/test-update-user/1')
        .send({});

      expect(response.status).toBe(200);
    });
  });

  describe('validateGetUsers', () => {
    beforeEach(() => {
      app.get('/test-get-users', validateGetUsers, (req, res) => {
        res.json({ success: true });
      });
    });

    it('debería permitir obtener usuarios sin parámetros', async () => {
      const response = await request(app)
        .get('/test-get-users');

      expect(response.status).toBe(200);
    });

    it('debería validar página como entero positivo', async () => {
      const response = await request(app)
        .get('/test-get-users?page=1');

      expect(response.status).toBe(200);
    });

    it('debería rechazar página negativa', async () => {
      const response = await request(app)
        .get('/test-get-users?page=-1');

      expect(response.status).toBe(400);
    });

    it('debería validar límite entre 1 y 100', async () => {
      const response = await request(app)
        .get('/test-get-users?limit=50');

      expect(response.status).toBe(200);
    });

    it('debería rechazar límite mayor a 100', async () => {
      const response = await request(app)
        .get('/test-get-users?limit=101');

      expect(response.status).toBe(400);
    });

    it('debería validar rol', async () => {
      const response = await request(app)
        .get('/test-get-users?role=admin');

      expect(response.status).toBe(200);
    });

    it('debería rechazar rol inválido', async () => {
      const response = await request(app)
        .get('/test-get-users?role=invalid');

      expect(response.status).toBe(400);
    });

    it('debería validar formato de ordenamiento', async () => {
      const response = await request(app)
        .get('/test-get-users?sort=name:asc');

      expect(response.status).toBe(200);
    });

    it('debería rechazar formato de ordenamiento inválido', async () => {
      const response = await request(app)
        .get('/test-get-users?sort=invalid-format');

      expect(response.status).toBe(400);
    });
  });

  describe('validateGetUserById', () => {
    beforeEach(() => {
      app.get('/test-get-user/:id', validateGetUserById, (req, res) => {
        res.json({ success: true });
      });
    });

    it('debería permitir obtener usuario con ID válido', async () => {
      const response = await request(app)
        .get('/test-get-user/1');

      expect(response.status).toBe(200);
    });

    it('debería rechazar ID inválido', async () => {
      const response = await request(app)
        .get('/test-get-user/invalid');

      expect(response.status).toBe(400);
    });

    it('debería rechazar ID negativo', async () => {
      const response = await request(app)
        .get('/test-get-user/-1');

      expect(response.status).toBe(400);
    });
  });

  describe('validateDeleteUser', () => {
    beforeEach(() => {
      app.delete('/test-delete-user/:id', validateDeleteUser, (req, res) => {
        res.json({ success: true });
      });
    });

    it('debería permitir eliminar usuario con ID válido', async () => {
      const response = await request(app)
        .delete('/test-delete-user/1');

      expect(response.status).toBe(200);
    });

    it('debería rechazar ID inválido', async () => {
      const response = await request(app)
        .delete('/test-delete-user/invalid');

      expect(response.status).toBe(400);
    });
  });
});

