const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No hay token. Acceso denegado.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Usa: Bearer TOKEN' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    // payload esperado: { id: userId, ... }
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

