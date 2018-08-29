/* eslint no-underscore-dangle: 0 */

const querystring = require('querystring');
const rp = require('request-promise');

const DOMAIN = 'https://api.airbnb.com';

class AirbnbOAuth {
  /**
   * @constructor
   * @param {String} clientId - airbnb client ID
   * @param {String} clientSecret - airbnb client secret
   */
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.defaults = {};
    this.generateAuthHeader();
  }

  /**
   * Set Default Options
   *
   * Examples:
   * ```
   * oauth.setOpts({ a: 1 });
   * ```
   * @param {Object} opts - options
   */
  setOpts(opts) {
    this.defaults = opts;
  }

  /**
   * Custom Request
   * @param {Object} opts - options
   */
  async request(opts = {}) {
    const options = Object.assign({}, this.defaults);
    Object.keys(opts).forEach((key) => {
      if (key !== 'headers') {
        options[key] = opts[key];
      } else if (opts.headers) {
        options.headers = options.headers || {};
        Object.assign(options.headers, opts.headers);
      }
    });
    // console.log('options: ', options);

    let data;
    try {
      data = await rp(options);
    } catch (err) {
      err.name = `AirbnbAPI ${err.name}`;
      throw err;
    }

    return data;
  }

  /**
   * Generate Authorization Header
   */
  generateAuthHeader() {
    const { clientId, clientSecret } = this;
    const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const auth = `Basic ${base64}`;

    this.setOpts({
      headers: {
        Authorization: auth,
      },
    });
  }

  /**
   * Make authorization URL
   * @param {String} redirect - redirect url
   * @param {String} state - param
   * @param {String} scope - permissions: vr, messages_write
   * @return {String} url
   */
  getAuthorizeURL(redirect, state, scope) {
    const url = 'https://www.airbnb.com/oauth2/auth';
    const info = {
      client_id: this.clientId,
      redirect_uri: redirect,
      scope: scope || 'vr',
      state: state || '',
    };

    return `${url}?${querystring.stringify(info)}`;
  }

  /**
   * Request Token
   * @param {String} [code] - authorization code
   * @param {String} [token] - access token
   * @param {Boolean} [reset] - reset refresh token
   */
  async _requestToken({ code, token, reset }) {
    const uri = `${DOMAIN}/v2/oauth2/authorizations`;
    const options = {
      method: 'POST',
      uri,
      qs: {
        _unwrapped: true,
      },
      body: {
      },
      json: true,
    };

    if (code) {
      options.body.code = code;
    }
    if (token) {
      options.body.refresh_token = token;
    }
    if (reset) {
      options.body.reset_refresh_token = 1;
    }

    const data = await this.request(options);
    return data;
  }

  /**
   * Exchanging Code for Tokens
   * @param {String} code - authorization code
   */
  async getAccessToken(code) {
    const data = await this._requestToken({ code });
    return data;
  }

  /**
   * Handle Token
   * @param {String} method - 'GET' or 'DELETE'
   * @param {String} token - access token
   */
  async _handleToken(method, token) {
    const uri = `${DOMAIN}/v2/oauth2/authorizations/${token}`;
    const options = {
      method,
      uri,
      qs: {
        _unwrapped: true,
      },
      json: true,
    };

    const data = await this.request(options);
    return data;
  }

  /**
   * Checking Token Status
   * @param {String} token - access token
   */
  async checkTokenStatus(token) {
    const data = await this._handleToken('GET', token);
    return data;
  }

  /**
   * Refresh Token
   * @param {String} token access token
   * @param {Boolean} [reset] need reset refresh token
   */
  async refreshToken(token, reset) {
    const data = await this._requestToken({ token, reset });
    return data;
  }

  /**
   * Revoking Token
   * @param {String} token access token
   */
  async revokingToken(token) {
    const data = await this._handleToken('DELETE', token);
    return data;
  }

  /**
   * Retrieving All Authorized Hosts
   * @param {Number} [limit] items count
   * @param {Number} [offset] offset
   */
  async retrieveAllHosts(limit, offset) {
    const apiKey = this.clientId;
    const uri = `${DOMAIN}/v2/oauth2/clients/${apiKey}`;
    const options = {
      method: 'GET',
      uri,
      qs: {
      },
      json: true,
    };

    if (limit) {
      options.qs._limit = limit;
    }
    if (offset) {
      options.qs._offset = offset;
    }

    const data = await this.request(options);
    return data;
  }
}

module.exports = AirbnbOAuth;
