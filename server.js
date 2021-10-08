import express, { json } from 'express';
import promBundle from 'express-prom-bundle';

import morgan from 'morgan';
import clientSession from 'client-sessions';

import { SESSION_SECRET } from './config.js';
import api from './src/api/index.js';
import { init as initRedis } from './src/persistence/cache/redis.js';
import { keyExpirationHandler } from './src/persistence/keys.js';

const app = express();
const metricsMiddleware = promBundle({
    includeMethod: true,
    normalizePath: false,
    includePath: true,
    customLabels: {
        projectName: 'appcues',
        author: 'Mario Ruiz Diaz'
    },
});

app.use(metricsMiddleware);

app.get('/', (request, response) => response.sendStatus(200));
app.get('/health', (request, response) => response.status(200).send("Appcues is running like a champion!"));

app.use(morgan('short'));
app.use(json());
app.use(
    clientSession({
        cookieName: 'session',
        secret: SESSION_SECRET,
        duration: 24 * 60 * 60 * 1000,
    }),
);

app.use(api);

let server;
export function start(port) {
    initRedis(process.env.REDIS_HOST || 'localhost', process.env.REDIS_PORT || 6379, keyExpirationHandler);
    server = app.listen(port, () => {
        console.log(`App started on port ${port}`);
    });
    return app;
}

export function stop() {
    server.close();
}
