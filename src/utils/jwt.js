const { jwtVerify, SignJWT } = require('jose');

/**
 * Returns the JWT secret as a Uint8Array (required by jose).
 * Reads from JWT_SECRET in .env — never hardcode secrets!
 */
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined in .env');
  return new TextEncoder().encode(secret);
};

/**
 * CreateJwtToken
 * Signs a new JWT token containing { email, id } as the payload.
 *
 * @param {string} email - User's email
 * @param {string} id    - User's MongoDB _id
 * @returns {Promise<string>} Signed JWT token string
 */
async function CreateJwtToken(email, id) {
  const secret = getSecret();

  const token = await new SignJWT({ email, id })
    .setProtectedHeader({ alg: 'HS256' })   // Algorithm: HMAC-SHA256
    .setIssuedAt()                           // iat: current timestamp
    .setIssuer(process.env.JWT_ISSUER || 'social-management-api')
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d') // Reads from .env
    .sign(secret);

  return token;
}

/**
 * DecodedJwtToken
 * Verifies the token signature and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 *
 * @param {string} token - JWT token string
 * @returns {Promise<object>} Decoded payload { email, id, iat, exp, iss }
 */
async function DecodedJwtToken(token) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

module.exports = { CreateJwtToken, DecodedJwtToken };
