const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const nonSecurePaths = ['/signup', '/login'];

  if (nonSecurePaths.includes(req.path)) return next();

  const { token, refreshToken } = req.cookies;

  const handleRefreshToken = () => {
    const userToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newToken = jwt.sign(
      {
        id: userToken.id,
        firstName: userToken.firstName,
        lastName: userToken.lastName,
        role: userToken.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 15 * 60 }
    );

    res.cookie('token', newToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    req.userToken = userToken;
  };

  const isTokenInvalid = () => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Invalid token' });
  };

  const isRefreshTokenInvalid = () => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Invalid refresh token' });
  };

  if (!token) {
    if (refreshToken) {
      try {
        handleRefreshToken();
        return next();
      } catch (err) {
        isRefreshTokenInvalid();
      }
    } else {
      isTokenInvalid();
    }
  } else {
    jwt.verify(token, process.env.JWT_SECRET, function (err, userToken) {
      if (err) {
        if (refreshToken) {
          try {
            handleRefreshToken();
            return next();
          } catch (err) {
            isRefreshTokenInvalid();
          }
        } else {
          isTokenInvalid();
        }
      }

      req.userToken = userToken;

      return next();
    });
  }
};

module.exports = authMiddleware;
