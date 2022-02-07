module.exports = {
  post: (req, res) => {

    // TODO: 세션 아이디를 통해 고유한 세션 객체에 접근할 수 있습니다.
    // 앞서 로그인시 세션 객체에 저장했던 값이 존재할 경우, 이미 로그인한 상태로 판단할 수 있습니다.
    // 세션 객체에 담긴 값의 존재 여부에 따라 응답을 구현하세요.

    if (!req.session.userId) {
      res.status(400).end();
    } else {
      console.log("로그아웃 진행: ", req.session.userId)
      req.session.destroy((err) => {
        if(err) throw err;
        console.log("로그아웃 성공");
        res.status(200).end();
      })
    }
  },
};
