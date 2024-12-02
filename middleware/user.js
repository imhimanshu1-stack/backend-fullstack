const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({
      errors: [
        {
          message: "Unauthorized",
        },
      ],
    });
  }

  token = token.split(" ")[1];

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser.userId;
    console.log(req.user);
    next();
  } catch (error) {
    return res.status(403).json({
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
};
