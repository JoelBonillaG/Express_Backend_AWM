const UserRepository = require('../../repositories/UserRepository');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      const users = await userRepository.findAll();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('debería retornar copia del array, no referencia', async () => {
      const users1 = await userRepository.findAll();
      const users2 = await userRepository.findAll();
      expect(users1).not.toBe(users2);
    });
  });

  describe('findById', () => {
    it('debería encontrar un usuario por ID existente', async () => {
      const user = await userRepository.findById(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('debería retornar undefined para ID inexistente', async () => {
      const user = await userRepository.findById(999);
      expect(user).toBeUndefined();
    });

    it('debería convertir string a número para el ID', async () => {
      const user = await userRepository.findById('1');
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email existente', async () => {
      const user = await userRepository.findByEmail('sofia.morales@empresa.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('sofia.morales@empresa.com');
    });

    it('debería retornar undefined para email inexistente', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    it('debería crear un nuevo usuario con ID autoincremental', async () => {
      const initialUsers = await userRepository.findAll();
      const initialCount = initialUsers.length;

      const newUserData = {
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'usuario'
      };

      const newUser = await userRepository.create(newUserData);

      expect(newUser).toBeInstanceOf(User);
      expect(newUser.id).toBeGreaterThan(initialCount);
      expect(newUser.name).toBe(newUserData.name);
      expect(newUser.email).toBe(newUserData.email);
      expect(newUser.createdAt).toBeInstanceOf(Date);
    });

    it('debería asignar IDs secuenciales', async () => {
      const user1 = await userRepository.create({
        name: 'Usuario 1',
        email: 'user1@test.com',
        password: 'pass1',
        role: 'usuario'
      });

      const user2 = await userRepository.create({
        name: 'Usuario 2',
        email: 'user2@test.com',
        password: 'pass2',
        role: 'usuario'
      });

      expect(user2.id).toBe(user1.id + 1);
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
      const existingUser = await userRepository.findById(1);
      const originalName = existingUser.name;

      const updatedUser = await userRepository.update(1, { name: 'Nombre Actualizado' });

      expect(updatedUser).toBeDefined();
      expect(updatedUser.name).toBe('Nombre Actualizado');
      expect(updatedUser.name).not.toBe(originalName);
    });

    it('debería retornar null para ID inexistente', async () => {
      const result = await userRepository.update(999, { name: 'Test' });
      expect(result).toBeNull();
    });

    it('debería preservar propiedades no actualizadas', async () => {
      const existingUser = await userRepository.findById(1);
      const originalEmail = existingUser.email;

      const updatedUser = await userRepository.update(1, { name: 'Solo Nombre' });

      expect(updatedUser.email).toBe(originalEmail);
    });

    it('debería convertir string a número para el ID', async () => {
      const updatedUser = await userRepository.update('1', { name: 'Actualizado' });
      expect(updatedUser).toBeDefined();
    });
  });

  describe('delete', () => {
    it('debería eliminar un usuario existente', async () => {
      const newUser = await userRepository.create({
        name: 'Usuario a Eliminar',
        email: 'delete@test.com',
        password: 'pass',
        role: 'usuario'
      });

      const userId = newUser.id;
      const result = await userRepository.delete(userId);

      expect(result).toBe(true);
      const deletedUser = await userRepository.findById(userId);
      expect(deletedUser).toBeUndefined();
    });

    it('debería retornar false para ID inexistente', async () => {
      const result = await userRepository.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('debería contar todos los usuarios sin filtros', async () => {
      const count = await userRepository.count();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('debería filtrar por rol', async () => {
      const adminCount = await userRepository.count({ role: 'admin' });
      const userCount = await userRepository.count({ role: 'usuario' });

      expect(adminCount).toBeGreaterThan(0);
      expect(userCount).toBeGreaterThan(0);
      expect(adminCount + userCount).toBeLessThanOrEqual(await userRepository.count());
    });

    it('debería filtrar por nombre (case insensitive)', async () => {
      const count = await userRepository.count({ name: 'sofia' });
      expect(count).toBeGreaterThan(0);
    });

    it('debería filtrar por email (case insensitive)', async () => {
      const count = await userRepository.count({ email: 'Sofia' });
      expect(count).toBeGreaterThan(0);
    });

    it('debería filtrar por estado activo', async () => {
      const activeCount = await userRepository.count({ active: true });
      const inactiveCount = await userRepository.count({ active: false });

      expect(activeCount).toBeGreaterThanOrEqual(0);
      expect(inactiveCount).toBeGreaterThanOrEqual(0);
    });

    it('debería combinar múltiples filtros', async () => {
      const count = await userRepository.count({
        role: 'admin',
        active: true
      });
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findWithFilters', () => {
    it('debería retornar usuarios paginados', async () => {
      const users = await userRepository.findWithFilters({}, {}, 0, 2);
      expect(users.length).toBeLessThanOrEqual(2);
    });

    it('debería aplicar filtros correctamente', async () => {
      const adminUsers = await userRepository.findWithFilters(
        { role: 'admin' },
        {},
        0,
        10
      );

      adminUsers.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('debería aplicar ordenamiento ascendente', async () => {
      const users = await userRepository.findWithFilters(
        {},
        { field: 'name', order: 'asc' },
        0,
        10
      );

      for (let i = 1; i < users.length; i++) {
        expect(users[i].name >= users[i - 1].name).toBe(true);
      }
    });

    it('debería aplicar ordenamiento descendente', async () => {
      const users = await userRepository.findWithFilters(
        {},
        { field: 'name', order: 'desc' },
        0,
        10
      );

      for (let i = 1; i < users.length; i++) {
        expect(users[i].name <= users[i - 1].name).toBe(true);
      }
    });

    it('debería respetar skip y limit', async () => {
      const allUsers = await userRepository.findAll();
      const page1 = await userRepository.findWithFilters({}, {}, 0, 2);
      const page2 = await userRepository.findWithFilters({}, {}, 2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);

      if (allUsers.length > 2) {
        expect(page1[0].id).not.toBe(page2[0]?.id);
      }
    });
  });
});

