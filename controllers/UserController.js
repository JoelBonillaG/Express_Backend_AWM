const { userService } = require('../config/dependencies');

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.name) filters.name = req.query.name;
      if (req.query.email) filters.email = req.query.email;
      if (req.query.active !== undefined) filters.active = req.query.active === 'true';
      
      const sort = {};
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        sort.field = field;
        sort.order = order || 'asc';
      }
      
      const result = await this.userService.getAllUsers(filters, sort, page, limit);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const requesterRole = req.user?.role || 'usuario';
      const newUser = await this.userService.createUser(req.body, requesterRole);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const requesterRole = req.user?.role || 'usuario';
      const requesterId = req.user?.id;
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.body,
        requesterRole,
        requesterId
      );
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const requesterRole = req.user?.rol;
      const requesterId = req.user?.id;
      const result = await this.userService.deleteUser(
        req.params.id,
        requesterRole,
        requesterId
      );
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController(userService);

