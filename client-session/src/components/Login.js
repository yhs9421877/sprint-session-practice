import React, { Component } from 'react';
const axios = require('axios');

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
    this.inputHandler = this.inputHandler.bind(this);
    this.loginRequestHandler = this.loginRequestHandler.bind(this);
  }

  inputHandler(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  async loginRequestHandler() {
    const loginUrl = "https://localhost:4000/users/login";
    const userInfoUrl = "https://localhost:4000/users/userinfo";

    try{
      await axios.post(loginUrl, {
        userId: this.state.username,
        password: this.state.password
      }); 
      
      const response = await axios.get(userInfoUrl); //400 status: req.session에 userId가 없음.
      this.props.loginHandler();
      this.props.setUserInfo(response.data);
      
      
    } catch(err) {
      console.log("loginRequestHandler failure");
      throw err;
    }
  }

  render() {
    return (
      <div className='loginContainer'>
        <div className='inputField'>
          <div>Username</div>
          <input
            name='username'
            onChange={(e) => this.inputHandler(e)}
            value={this.state.username}
            type='text'
          />
        </div>
        <div className='inputField'>
          <div>Password</div>
          <input
            name='password'
            onChange={(e) => this.inputHandler(e)}
            value={this.state.password}
            type='password'
          />
        </div>
        <div className='passwordField'>
          <button onClick={this.loginRequestHandler} className='loginBtn'>
            Login
          </button>
        </div>
      </div>
    );
  }
}

export default Login;