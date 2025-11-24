class RefreshToken {
  constructor({ id, userId, token, expiresAt, replacedBy = null, revoked = false, createdAt = new Date() }) {
    this.id = id;
    this.userId = userId;
    this.token = token;
    this.expiresAt = expiresAt;
    this.replacedBy = replacedBy;
    this.revoked = revoked;
    this.createdAt = createdAt;
  }

  isExpired() {
    return new Date() > this.expiresAt;
  }

  isRevoked() {
    return this.revoked;
  }

  isValid() {
    return !this.isExpired() && !this.isRevoked();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = RefreshToken;



