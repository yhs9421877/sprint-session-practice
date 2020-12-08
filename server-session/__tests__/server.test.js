const app = require('../index');
const request = require('supertest');
const agent = request(app);

const factoryService = require('./helper/FactoryService');
const databaseConnector = require('../lib/databaseConnector');
const DB_CONNECTOR = new databaseConnector();
const { expect, assert } = require('chai');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

describe('Authentication - Server', () => {
  before(async () => {
    await factoryService.init();
    console.log('\n  🏭factory service started.\n');
  });

  describe('Authentication - Database', () => {
    after(async () => {
      await DB_CONNECTOR.terminate();
    });

    it('should connect to database', async () => {
      let response;

      console.log('DB configurations');
      console.table(DB_CONNECTOR['config']);

      try {
        response = await DB_CONNECTOR.init();
      } catch (e) {
        console.log(e);
      }

      assert.strictEqual(response, 'ok');
    });

    it('should have table `Users` in database', async () => {
      await DB_CONNECTOR.init();

      try {
        await DB_CONNECTOR.query('DESCRIBE Users');
      } catch (error) {
        throw error;
      }
    });
  });

  describe('Authentication - Server', () => {
    before(async () => {
      await DB_CONNECTOR.init();
    });

    after(async () => {
      await DB_CONNECTOR.terminate();
    });

    beforeEach(async () => {
      await factoryService.setup();
      await factoryService.insertTestUser();
    });

    afterEach(async () => {
      await factoryService.deleteTestUser({
        email: `"kimcoding@codestates.com"`,
      });
    });

    describe('⛳️ POST /users/login', () => {
      it("invalid userId or password request should respond with message 'not authorized'", async () => {
        const response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: 'helloWorld',
        });

        expect(response.body.message).to.eql('not authorized');
      });

      it("valid userId and password request should respond with message 'ok'", async () => {
        const response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: '1234',
        });

        expect(response.body.message).to.eql('ok');
      });

      it('connect.sid cookie value should be set as encrypted value while using express-session', async () => {
        const response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: '1234',
        });

        let resCookies = response.header['set-cookie'];
        console.log(resCookies)

        expect(resCookies[0]).include('connect.sid');
      });

      it('cookies should have Secure and SameSite option', async () => {
        const response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: '1234',
        });

        let resCookies = response.header['set-cookie'][0];

        expect(resCookies).include('HttpOnly');
        expect(resCookies).include('Secure');
        expect(resCookies).include('SameSite=None');
      });
    });

    describe('⛳️ POST /users/logout', () => {
      it('should return 200 status code after logout successfully', async () => {
        let response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: '1234',
        });
        let resCookies = response.header['set-cookie'];

        response = await agent.post('/users/logout').set('Cookie', resCookies);

        expect(response.status).to.eql(200);
      });
    });

    describe('⛳️ GET /users/userinfo', () => {
      it('should return 200 status code when requested with a valid cookie', async () => {
        let response = await agent.post('/users/login').send({
          userId: 'kimcoding',
          password: '1234',
        });
        let resCookies = response.header['set-cookie'];
        response = await agent.get('/users/userinfo').set('Cookie', resCookies);

        expect(response.status).to.eql(200);
        expect(response.body.message).to.eql('ok');
      });

      it('should return 400 status code when requested without a cookie', async () => {
        let response = await agent.get('/users/userinfo');

        expect(response.status).to.eql(400);
        expect(response.body.message).to.eql('not authorized');
      });
    });
  });

  after(async () => {
    await factoryService.terminate();
    console.log('\n  🏭factory service terminated.\n');
  });
});