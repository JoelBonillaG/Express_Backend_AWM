const UserControllerClass = require('../../controllers/UserController').constructor;

jest.mock('../../config/dependencies', () => ({
  userService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  }
}));

const { userService } = require('../../config/dependencies');

describe('UserController', () => {
  let userController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    userController = new UserControllerClass(userService);

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'admin' }
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debería retornar usuarios con paginación por defecto', async () => {
      const mockResult = {
        data: [{ id: 1, name: 'Usuario 1' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      userService.getAllUsers.mockResolvedValue(mockResult);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith({}, {}, 1, 10);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: mockResult.pagination
      });
    });

    it('debería aplicar filtros de query params', async () => {
      mockReq.query = {
        page: '2',
        limit: '5',
        role: 'admin',
        name: 'Test',
        email: 'test@example.com',
        active: 'true'
      };

      const mockResult = {
        data: [],
        pagination: { page: 2, limit: 5, total: 0 }
      };

      userService.getAllUsers.mockResolvedValue(mockResult);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        { role: 'admin', name: 'Test', email: 'test@example.com', active: true },
        {},
        2,
        5
      );
    });

    it('debería aplicar ordenamiento desde query params', async () => {
      mockReq.query = { sort: 'name:desc' };

      const mockResult = { data: [], pagination: {} };
      userService.getAllUsers.mockResolvedValue(mockResult);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        {},
        { field: 'name', order: 'desc' },
        1,
        10
      );
    });
  });

  describe('getUserById', () => {
    it('debería retornar un usuario por ID', async () => {
      mockReq.params.id = '1';
      const mockUser = { id: 1, name: 'Usuario Test' };

      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockReq, mockRes, mockNext);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('debería llamar a next con error si el servicio falla', async () => {
      mockReq.params.id = '999';
      const mockError = new Error('Usuario no encontrado');
      userService.getUserById.mockRejectedValue(mockError);

      await userController.getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createUser', () => {
    it('debería crear un usuario exitosamente', async () => {
      mockReq.body = {
        name: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        password: 'password123'
      };

      const mockNewUser = { id: 4, name: 'Nuevo Usuario', email: 'nuevo@example.com' };
      userService.createUser.mockResolvedValue(mockNewUser);

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(userService.createUser).toHaveBeenCalledWith(
        mockReq.body,
        'admin'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario creado exitosamente',
        data: mockNewUser
      });
    });

    it('debería usar rol por defecto si req.user no existe', async () => {
      mockReq.user = null;
      mockReq.body = { name: 'Usuario', email: 'test@example.com', password: 'pass' };
      userService.createUser.mockResolvedValue({});

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(userService.createUser).toHaveBeenCalledWith(
        mockReq.body,
        'usuario'
      );
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario exitosamente', async () => {
      mockReq.params.id = '1';
      mockReq.body = { name: 'Usuario Actualizado' };
      const mockUpdatedUser = { id: 1, name: 'Usuario Actualizado' };

      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(mockReq, mockRes, mockNext);

      expect(userService.updateUser).toHaveBeenCalledWith(
        '1',
        mockReq.body,
        'admin',
        1
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: mockUpdatedUser
      });
    });

    it('debería usar valores por defecto si req.user no existe', async () => {
      mockReq.user = null;
      mockReq.params.id = '1';
      mockReq.body = { name: 'Updated' };
      userService.updateUser.mockResolvedValue({});

      await userController.updateUser(mockReq, mockRes, mockNext);

      expect(userService.updateUser).toHaveBeenCalledWith(
        '1',
        mockReq.body,
        'usuario',
        undefined
      );
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      mockReq.params.id = '2';
      const mockResult = { message: 'Usuario eliminado exitosamente' };

      userService.deleteUser.mockResolvedValue(mockResult);

      await userController.deleteUser(mockReq, mockRes, mockNext);

      expect(userService.deleteUser).toHaveBeenCalledWith(
        '2',
        'admin',
        1
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message
      });
    });

    it('debería manejar errores correctamente', async () => {
      mockReq.params.id = '999';
      const mockError = new Error('Usuario no encontrado');
      userService.deleteUser.mockRejectedValue(mockError);

      await userController.deleteUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});

