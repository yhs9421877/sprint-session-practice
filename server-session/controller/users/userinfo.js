const { Users } = require('../../models');

module.exports = {
  get: async (req, res) => {
    console.log("[userinfo] 유저인포: ", req.session);
    if (!req.session.userId) {
      console.log("userinfo 실패");
      res.status(400).send({message: "not authorized"});
    } else {
      console.log("userinfo 성공");
      res.status(200).send({
        message: "ok",
        data: {
          userId: req.session.userId,
          email: req.session.email
        }
      });
    }
  },
};
