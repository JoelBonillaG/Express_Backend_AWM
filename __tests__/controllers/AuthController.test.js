const AuthControllerClass = require('../../controllers/AuthController').constructor;

jest.mock('../../config/dependencies', () => ({
  authService: {
    login: jest.fn()
  }
}));

const { authService } = require('../../config/dependencies');

describe('AuthController', () => {
  let authController;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    authController = new AuthControllerClass(authService);
    
    mockReq = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debería realizar login exitoso y retornar token y usuario', async () => {
      const mockResult = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'usuario'
        }
      };

      authService.login.mockResolvedValue(mockResult);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: mockResult
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería llamar a next con error si el servicio lanza error', async () => {
      const mockError = new Error('Credenciales inválidas');
      authService.login.mockRejectedValue(mockError);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('debería extraer email y password del body correctamente', async () => {
      const mockResult = { token: 'token', user: {} };
      authService.login.mockResolvedValue(mockResult);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith(
        mockReq.body.email,
        mockReq.body.password
      );
    });
  });
});

