class User {
  constructor({ id, name, email, password, role, active = true, createdAt = new Date(), oauthProvider = null, oauthId = null }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.active = active;
    this.createdAt = createdAt;
    this.oauthProvider = oauthProvider;
    this.oauthId = oauthId;
  }

  toJSON() {
    const { password, ...usuarioSinPassword } = this;
    return usuarioSinPassword;
  }
}

module.exports = User;

