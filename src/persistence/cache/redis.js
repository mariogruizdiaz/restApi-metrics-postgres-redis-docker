import { createClient } from 'redis';

let client;

export async function init(host, port) {
    client = createClient({
        host,
        port
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    client.on("ready", function (err) {
        console.info(`Redis is ready`);
    });

}

export async function incrementBy(key, incrementAmount) {
    if (!await client.get(key)) {
        await client.setex(key, process.env.REDIS_CACHE_EXPIRATION_SECS || 10, incrementAmount);
    } else {
        await client.incrby(key, incrementAmount);
    }
    return;
}
