const AuthService = require('../../services/AuthService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  let authService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn()
    };
    authService = new AuthService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'usuario',
      active: true,
      toJSON: jest.fn(() => ({
        id: 1,
        email: 'test@example.com',
        role: 'usuario',
        active: true
      }))
    };

    it('debería realizar login exitoso con credenciales válidas', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateToken').mockReturnValue('mock-token');

      const result = await authService.login('test@example.com', 'password123');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('debería lanzar error si el usuario no existe', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar error si la cuenta está inactiva', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(
        authService.login('test@example.com', 'password123')
      ).rejects.toThrow('La cuenta de usuario está inactiva');
    });

    it('debería lanzar error si la contraseña es incorrecta', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('generateToken', () => {
    it('debería generar un token JWT válido', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'admin'
      };

      const token = authService.generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_in_production');
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('admin');
    });
  });

  describe('verifyToken', () => {
    it('debería verificar un token válido', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'usuario'
      };

      const token = authService.generateToken(mockUser);
      const decoded = authService.verifyToken(token);

      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('usuario');
    });

    it('debería lanzar error con token inválido', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow('Token inválido o expirado');
    });

    it('debería lanzar error con token expirado', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com', role: 'usuario' },
        process.env.JWT_SECRET || 'default_secret_change_in_production',
        { expiresIn: '-1h' }
      );

      expect(() => {
        authService.verifyToken(expiredToken);
      }).toThrow('Token inválido o expirado');
    });
  });
});

