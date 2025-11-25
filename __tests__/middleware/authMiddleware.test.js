const { authenticate, authorize } = require('../../middleware/authMiddleware');

jest.mock('../../config/dependencies', () => ({
  authService: {
    verifyToken: jest.fn()
  }
}));

const { authService } = require('../../config/dependencies');

describe('authMiddleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('debería autenticar usuario con token válido', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecoded = {
        id: 1,
        email: 'test@example.com',
        role: 'admin'
      };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      authService.verifyToken.mockReturnValue(mockDecoded);

      await authenticate(mockReq, mockRes, mockNext);

      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(mockReq.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si no hay header de autorización', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Autenticación requerida. Por favor proporcione un token válido.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el header no comienza con Bearer', async () => {
      mockReq.headers.authorization = 'Invalid token-format';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería extraer el token correctamente del header Bearer', async () => {
      const mockToken = 'test-token-123';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      authService.verifyToken.mockReturnValue({ id: 1 });

      await authenticate(mockReq, mockRes, mockNext);

      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(authService.verifyToken).not.toHaveBeenCalledWith(`Bearer ${mockToken}`);
    });

    it('debería retornar 401 si el token es inválido', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      authService.verifyToken.mockImplementation(() => {
        throw new Error('Token inválido o expirado');
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido o expirado'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('debería permitir acceso si el usuario tiene rol permitido', () => {
      mockReq.user = { id: 1, role: 'admin' };

      const middleware = authorize('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('debería permitir acceso con múltiples roles permitidos', () => {
      mockReq.user = { id: 1, role: 'usuario' };

      const middleware = authorize('admin', 'usuario');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debería retornar 403 si el usuario no tiene rol permitido', () => {
      mockReq.user = { id: 1, role: 'usuario' };

      const middleware = authorize('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permisos insuficientes. Rol requerido: admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar 403 con mensaje para múltiples roles requeridos', () => {
      mockReq.user = { id: 1, role: 'guest' };

      const middleware = authorize('admin', 'usuario');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Permisos insuficientes. Rol requerido: admin o usuario'
      });
    });

    it('debería retornar 401 si no hay usuario autenticado', () => {
      mockReq.user = undefined;

      const middleware = authorize('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Autenticación requerida'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería funcionar correctamente cuando se llama después de authenticate', async () => {
      const mockToken = 'valid-token';
      const mockUser = { id: 1, role: 'admin' };

      mockReq.headers.authorization = `Bearer ${mockToken}`;
      authService.verifyToken.mockReturnValue(mockUser);

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);

      const authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });
});

