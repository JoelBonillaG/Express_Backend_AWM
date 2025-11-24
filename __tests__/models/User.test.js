const User = require('../../models/User');

describe('User Model', () => {
  describe('constructor', () => {
    it('debería crear una instancia de User con todos los campos', () => {
      const userData = {
        id: 1,
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'usuario',
        active: true,
        createdAt: new Date()
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.role).toBe(userData.role);
      expect(user.active).toBe(userData.active);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('debería usar valores por defecto para active y createdAt', () => {
      const userData = {
        id: 1,
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'usuario'
      };

      const user = new User(userData);

      expect(user.active).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('debería permitir crear usuario inactivo', () => {
      const userData = {
        id: 1,
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'usuario',
        active: false
      };

      const user = new User(userData);

      expect(user.active).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('debería retornar objeto JSON sin password', () => {
      const userData = {
        id: 1,
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'usuario'
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).not.toHaveProperty('password');
      expect(json.id).toBe(userData.id);
      expect(json.name).toBe(userData.name);
      expect(json.email).toBe(userData.email);
      expect(json.role).toBe(userData.role);
      expect(json.active).toBe(true);
      expect(json.createdAt).toBeInstanceOf(Date);
    });

    it('debería incluir todos los campos excepto password', () => {
      const userData = {
        id: 2,
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'secret123',
        role: 'admin',
        active: true,
        createdAt: new Date('2024-01-01')
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('role');
      expect(json).toHaveProperty('active');
      expect(json).toHaveProperty('createdAt');
      expect(json).not.toHaveProperty('password');
    });

    it('debería preservar valores originales en el objeto', () => {
      const userData = {
        id: 3,
        name: 'Test User',
        email: 'test@example.com',
        password: 'originalPassword',
        role: 'usuario'
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(user.password).toBe('originalPassword');
      expect(json.password).toBeUndefined();
    });
  });
});

