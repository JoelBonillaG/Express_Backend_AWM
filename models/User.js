class User {
  constructor({ id, name, email, password, role, active = true, createdAt = new Date() }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.active = active;
    this.createdAt = createdAt;
  }

  toJSON() {
    const { password, ...usuarioSinPassword } = this;
    return usuarioSinPassword;
  }
}

module.exports = User;

