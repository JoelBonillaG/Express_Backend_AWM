class User {
  constructor({ id, nombre, email, password, rol, activo = true, fechaCreacion = new Date() }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password; // En producción, esto debería estar hasheado
    this.rol = rol; // 'admin', 'usuario'
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
  }

  toJSON() {
    // Excluir password al serializar
    const { password, ...usuarioSinPassword } = this;
    return usuarioSinPassword;
  }
}

module.exports = User;

