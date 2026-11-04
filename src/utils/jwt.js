// In Node/Vercel (CommonJS), jose v6 is an ES Module, so we dynamically import it
let joseModule = null;

const getJose = async () => {
  if (!joseModule) {
    joseModule = await import('jose');
  }
  return joseModule;
};

/**
 * Returns the JWT secret as a Uint8Array (required by jose).
 * Reads from JWT_SECRET in .env
 */
const getSecret = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
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
  const { SignJWT } = await getJose();
  const secret = getSecret();

  const token = await new SignJWT({ email, id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER || 'social-management-api')
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(secret);

  return token;
}

/**
 * DecodedJwtToken
 * Verifies the token signature and returns the decoded payload.
 *
 * @param {string} token - JWT token string
 * @returns {Promise<object>} Decoded payload { email, id, iat, exp, iss }
 */
async function DecodedJwtToken(token) {
  const { jwtVerify } = await getJose();
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

module.exports = { CreateJwtToken, DecodedJwtToken };
