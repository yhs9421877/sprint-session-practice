// 해당 모델의 인스턴스를 models/index.js에서 가져옵니다.
const { Users } = require('../../models');

module.exports = {
  post: async (req, res) => {
    // userInfo는 유저정보가 데이터베이스에 존재하고, 완벽히 일치하는 경우에만 데이터가 존재합니다.
    // 만약 userInfo가 NULL 혹은 빈 객체라면 전달받은 유저정보가 데이터베이스에 존재하는지 확인해 보세요
    const userInfo = await Users.findOne({
      where: { userId: req.body.userId, password: req.body.password },
    });

    if (!userInfo) {
      // 없는 경우
      res.status(400).send({userInfo: null, message: 'not authorized'});
      console.log("not authorized");
    } else {
      req.session.userId = userInfo.userId;
      console.log("로그인 성공: ", req.session.userId)
      console.log("로그인 성공: ", req.session);
      res.status(200).send({userInfo, message: 'ok'});

    }
  }
}