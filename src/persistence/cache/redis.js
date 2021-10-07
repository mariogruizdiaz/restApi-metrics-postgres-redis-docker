import asyncRedis from "async-redis";

let client;

export async function init(host, port) {
    client = asyncRedis.createClient({
        host,
        port
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    client.on("ready", function (err) {
        console.info(`Redis is ready`);
    });

}

export async function incrementBy(key, incrementAmount) {
    let value = await client.get(key);
    if (!value) {
        await client.setex(key, process.env.REDIS_CACHE_EXPIRATION_SECS || 10, incrementAmount);
        return incrementAmount;
    } else {
        await client.incrby(key, incrementAmount);
        return Number.parseInt(value) + incrementAmount;
    }
}

export async function find(key) {
    return await client.get(key);
}

export async function setEx(key, expireSeconds, value) {
    return await client.setex(key, expireSeconds, value);
}
