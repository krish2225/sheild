import jwt from 'jsonwebtoken';

export const authenticate = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.token;

      if (!token) return res.status(401).json({ message: 'Unauthorized' });

      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      req.user = payload;

      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};


