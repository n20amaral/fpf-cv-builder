# FPF CV Builder

Due to CORS protection a proxy server is needed to run this website. Inside `fpf-proxy-server` there is a azure function that is configured to be used as proxy server.

## Proxy Server Local Development Setup Instructions

1. Make sure you have the [NodeJS](https://nodejs.org) an [Azure Function Core Tools](https://github.com/Azure/azure-functions-core-tools) installed in you machine.
2. Run `npm install`
3. Create a `local.settings.json` with this content:

   ```
   {
        "IsEncrypted": false,
        "Values": {
            "AzureWebJobsStorage": "",
            "FUNCTIONS_WORKER_RUNTIME": "node"
        },
        "Host": {
            "CORS": "*",
            "CORSCredentials": false
        }
   }
   ```

   With this your function will not valid cors locally.

4. Run `func start` 5. Make sure the function runs locally under port `7071`. Otherwise change the javascript code where the function url is defined.
