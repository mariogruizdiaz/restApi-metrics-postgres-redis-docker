import { Router } from 'express';
import { incrementBy, find as findKeyInCache, setEx } from '../persistence/cache/redis.js';
import { find as findKeyInDb } from '../persistence/keys.js';

const router = new Router();

router.post('/', async (request, response) => {
    const { key, value } = request.body;
    try {

        if (!key || !value) {
            return response
                .status(400)
                .json({ message: 'key and value must be provided' });
        }

        if (Number.isNaN(value)) {
            return response
                .status(400)
                .json({ message: 'The value must be a number' });
        }

        let currentValue = await findKeyInCache(key);
        if (currentValue){
            return response.status(200).json({ newValue: await incrementBy(key, value) });
        } else {
            currentValue = await findKeyInDb(key);
            let newValue = currentValue? currentValue + value : value;
            await setEx(key, process.env.REDIS_CACHE_EXPIRATION_SECS || 10, newValue);
            // subcribe to the key
            return response.status(200).json({ newValue });
        }
    } catch (error) {
        console.error(
            `createUser({ email: ${request.body.email} }) >> Error: ${error.stack}`,
        );
        response.status(500).send(`Something went wrong when trying to increment the key ${key} by ${value}`);
    }
});

export default router;
