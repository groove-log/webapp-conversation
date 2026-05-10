
const { ChatClient } = require('dify-client');
const client = new ChatClient('dummy', 'https://api.dify.ai/v1');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
