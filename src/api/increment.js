import { Router } from 'express';
import { incrementBy, get as findKeyInCache, setEx, set, SHADOW_KEY } from '../persistence/cache/redis.js';
import { find as findKeyInDb } from '../persistence/keys.js';
import sessionMiddleware from '../middleware/session-middleware.js';

const router = new Router();

router.post('/', sessionMiddleware, async (request, response) => {
    const { key, value } = request.body;
    try {

        if (!key || !value) {
            return response
                .status(400)
                .json({ message: 'key and value must be provided' });
        }

        const formatedValue = Number.parseInt(value.toString());
        if (Number.isNaN(formatedValue)) {
            return response
                .status(400)
                .json({ message: 'The value must be a number' });
        }

        let currentValue = await findKeyInCache(key);
        if (currentValue){
            return response.status(200).json({ newValue: await incrementBy(key, formatedValue) });
        } else {
            currentValue = await findKeyInDb(key);
            let newValue = currentValue? currentValue + formatedValue : formatedValue;
            await set(key, newValue);
            await setEx(`${key}${SHADOW_KEY}`, process.env.REDIS_CACHE_EXPIRATION_SECS || 10, "");
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
