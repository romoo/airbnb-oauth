# airbnb-oauth

Airbnb OAuth Wrapper for Nodejs

## Installation

```shell
$ npm install airbnb-oauth --save
```

## Usage

### Initialization

Get client ID and client secret: https://www.airbnb.com/partner

```javascript
const OAuth = require('airbnb-oauth');
const client = new OAuth('clientId', 'clientSecret');
```

### Make authorization URL

```javascript
const url = client.getAuthorizeURL('redirectUrl', 'state', 'scope');
```

### Exchanging Code for Tokens

```javascript
const result = await client.getAccessToken('code');
```

Example Response

```javascript
{
  "access_token": "40xdf4fvdotrpnwv6tkuroaze",
  "expires_at": 1422594787,
  "refresh_token": "d1gwltceepbiouw6dznxpf7k2",
  "user_id": 1603070
}
```

### Checking Token Status

```javascript
const result = await client.checkTokenStatus('accessToken');
```

Example Response

```javascript
{
  "expires_at": 1422595153,
  "token": "e8ef4q56gf840g3vnnobub4a5",
  "token_type": "access_token",
  "user_id": 1603070,
  "valid": true
}
```

### Refreshing a Token

```javascript
const result = await client.refreshToken('accessToken');

// reset your refresh token
const result = await client.refreshToken('accessToken', 1);
```

Example Response

```javascript
{
  "access_token": "40xdf4fvdotrpnwv6tkuroaze", // new access token to use in API calls for the next 24 hours
  "expires_at": 1422594787,  // Unix time
  "refresh_token": "d1gwltceepbiouw6dznxpf7k2", // returned if reset_refresh_token was set to 1
  "user_id": 1603070
}
```

### Revoking a Token

```javascript
const result = await client.revokingToken('accessToken');
```

### Retrieving All Authorized Hosts

```javascript
// limit: optional, defaults is 25
// offset: optional, defaults is 0
const result = await client.retrieveAllHosts('limit', 'offset');
```

Example Response

```javascript
{
  "count":2,
  "items":[
    {
      "user_id":22909678
    },
    {
      "user_id":18890019
    }
  ]
}
```

## License

[Apache 2.0](./LICENSE)
