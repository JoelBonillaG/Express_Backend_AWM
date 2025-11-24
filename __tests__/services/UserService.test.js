const UserService = require('../../services/UserService');
const bcrypt = require('bcryptjs');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findWithFilters: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    userService = new UserService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debería retornar usuarios paginados', async () => {
      const mockUsers = [
        { id: 1, name: 'Usuario 1', email: 'user1@test.com', toJSON: () => ({ id: 1, name: 'Usuario 1' }) },
        { id: 2, name: 'Usuario 2', email: 'user2@test.com', toJSON: () => ({ id: 2, name: 'Usuario 2' }) }
      ];

      mockUserRepository.findWithFilters.mockResolvedValue(mockUsers);
      mockUserRepository.count.mockResolvedValue(2);

      const result = await userService.getAllUsers({}, {}, 1, 10);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('debería aplicar filtros correctamente', async () => {
      const filters = { role: 'admin' };
      mockUserRepository.findWithFilters.mockResolvedValue([]);
      mockUserRepository.count.mockResolvedValue(0);

      await userService.getAllUsers(filters, {}, 1, 10);

      expect(mockUserRepository.findWithFilters).toHaveBeenCalledWith(
        filters,
        {},
        0,
        10
      );
      expect(mockUserRepository.count).toHaveBeenCalledWith(filters);
    });

    it('debería calcular paginación correctamente', async () => {
      mockUserRepository.findWithFilters.mockResolvedValue([]);
      mockUserRepository.count.mockResolvedValue(25);

      const result = await userService.getAllUsers({}, {}, 2, 10);

      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('getUserById', () => {
    it('debería retornar un usuario por ID', async () => {
      const mockUser = {
        id: 1,
        name: 'Usuario Test',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, name: 'Usuario Test' })
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('createUser', () => {
    const mockUserData = {
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      password: 'password123',
      role: 'usuario'
    };

    it('debería crear un usuario exitosamente', async () => {
      const mockCreatedUser = {
        id: 4,
        ...mockUserData,
        password: bcrypt.hashSync('password123', 10),
        toJSON: () => ({ id: 4, name: 'Nuevo Usuario', email: 'nuevo@example.com' })
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(mockUserData, 'admin');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nuevo@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('debería encriptar la contraseña antes de crear', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        ...mockUserData,
        password: 'hashed',
        toJSON: () => ({})
      });

      await userService.createUser(mockUserData, 'admin');

      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe('password123');
      expect(bcrypt.compareSync('password123', createCall.password)).toBe(true);
    });

    it('debería lanzar error si el email ya existe', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 1, email: 'nuevo@example.com' });

      await expect(userService.createUser(mockUserData, 'admin')).rejects.toThrow(
        'El correo electrónico ya existe'
      );
    });

    it('debería lanzar error si un no-admin intenta crear admin', async () => {
      // El código usa 'rol' en createUser (línea 45 de UserService.js)
      const adminUserData = { ...mockUserData, rol: 'admin' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.createUser(adminUserData, 'usuario')).rejects.toThrow(
        'Solo los administradores pueden crear usuarios administradores'
      );
    });
  });

  describe('updateUser', () => {
    const existingUser = {
      id: 1,
      name: 'Usuario Original',
      email: 'original@example.com',
      role: 'usuario'
    };

    it('debería actualizar un usuario exitosamente', async () => {
      const updateData = { name: 'Usuario Actualizado' };
      const updatedUser = {
        ...existingUser,
        ...updateData,
        toJSON: () => ({ id: 1, name: 'Usuario Actualizado' })
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData, 'admin', 2);

      expect(result.name).toBe('Usuario Actualizado');
    });

    it('debería permitir a usuarios actualizar su propio perfil', async () => {
      const updateData = { name: 'Mi Nombre Actualizado' };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue({
        ...existingUser,
        ...updateData,
        toJSON: () => ({})
      });

      await userService.updateUser('1', updateData, 'usuario', 1);

      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('debería lanzar error si usuario no existe', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser(999, {}, 'admin', 1)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });

    it('debería lanzar error si usuario no admin intenta actualizar otro usuario', async () => {
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.updateUser(1, {}, 'usuario', 2)).rejects.toThrow(
        'Solo puedes actualizar tu propio perfil'
      );
    });

    it('debería lanzar error si no admin intenta cambiar rol', async () => {
      const updateData = { role: 'admin' };
      mockUserRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.updateUser(1, updateData, 'usuario', 1)).rejects.toThrow(
        'Solo los administradores pueden cambiar los roles de usuario'
      );
    });
  });

  describe('deleteUser', () => {
    const mockUser = {
      id: 2,
      name: 'Usuario a Eliminar',
      email: 'delete@example.com'
    };

    it('debería eliminar un usuario exitosamente', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser(2, 'admin', 1);

      expect(result.message).toBe('Usuario eliminado exitosamente');
      expect(mockUserRepository.delete).toHaveBeenCalledWith(2);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser(999, 'admin', 1)).rejects.toThrow(
        'Usuario no encontrado'
      );
    });

    it('debería lanzar error si intenta eliminarse a sí mismo', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(userService.deleteUser(2, 'admin', 2)).rejects.toThrow(
        'No puedes eliminar tu propia cuenta'
      );
    });

    it('debería lanzar error si no es admin', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(userService.deleteUser(2, 'usuario', 1)).rejects.toThrow(
        'Solo los administradores pueden eliminar usuarios'
      );
    });
  });
});

