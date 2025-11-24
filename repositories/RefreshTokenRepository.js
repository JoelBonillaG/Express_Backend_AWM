const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

class RefreshTokenRepository {
  constructor() {
    this.tokens = [];
    this.nextId = 1;
  }

  async create(userId, expiresInDays = 7) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = new RefreshToken({
      id: this.nextId++,
      userId,
      token,
      expiresAt
    });

    this.tokens.push(refreshToken);
    return refreshToken;
  }

  async findByToken(token) {
    return this.tokens.find(t => t.token === token);
  }

  async findByUserId(userId) {
    return this.tokens.filter(t => t.userId === userId);
  }

  async revoke(token) {
    const refreshToken = await this.findByToken(token);
    if (refreshToken) {
      refreshToken.revoked = true;
      return true;
    }
    return false;
  }

  async revokeAllForUser(userId) {
    const userTokens = await this.findByUserId(userId);
    userTokens.forEach(token => {
      token.revoked = true;
    });
    return userTokens.length;
  }

  async replace(oldToken, newToken) {
    const oldRefreshToken = await this.findByToken(oldToken);
    if (oldRefreshToken) {
      oldRefreshToken.replacedBy = newToken.id;
      oldRefreshToken.revoked = true;
      return true;
    }
    return false;
  }

  async deleteExpired() {
    const now = new Date();
    this.tokens = this.tokens.filter(t => t.expiresAt > now);
  }

  async delete(id) {
    const index = this.tokens.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.tokens.splice(index, 1);
    return true;
  }
}

module.exports = RefreshTokenRepository;



