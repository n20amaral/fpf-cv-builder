# FPF CV Builder

Due to CORS protection a proxy server is needed to run this website. Inside `fpf-proxy-server` there is a azure function that is configured to be used as proxy server.

## Proxy Server Setup Instructions

1. Make sure you have the [NodeJS](https://nodejs.org) an [Azure Function Core Tools](https://github.com/Azure/azure-functions-core-tools) installed in you machine.
2. Run `npm install`
3. Run `func start`
4. Make sure the function runs locally under port `7071`. Otherwise change the javascript code where the function url is defined.
