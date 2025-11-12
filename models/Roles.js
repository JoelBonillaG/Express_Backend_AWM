const ROLES = {
  ADMIN: 'admin',
  USER: 'usuario'
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 2,
  [ROLES.USER]: 1
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  hasPermission: (userRole, requiredRole) => {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }
};

