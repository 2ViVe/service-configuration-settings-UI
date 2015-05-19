var path = require('path');

configFilesDir = path.join(__dirname, "../config.json");

global.APP = {
	ROOT_CONTAINER: "#container",
    REQUEST_HEADER: {
            "Accept": 'application/json',
            'Accept-Language': 'en-US',
            'Content-Type': 'application/json'
        },
    REQUEST_TIMEOUT: 3000,
    CONFIG_NAME: configFilesDir
};