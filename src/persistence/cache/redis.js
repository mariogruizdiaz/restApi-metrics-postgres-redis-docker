import { createClient } from "redis";

let client;
export const SHADOW_KEY = '_shadow'

export async function init(host, port, keyExpirationHandler) {
    client = createClient({
        host,
        port
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    client.on("ready", function (err) {
        console.info(`Redis is ready`);
        client.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], (e, r) => subscribeExpired(e, r, keyExpirationHandler));
    });

}

function subscribeExpired(e, r, handler) {
    let sub = client.duplicate();
    sub.subscribe('__keyevent@0__:expired', function () {
        console.log('Appcues worker_jpb is subscribed to "__keyevent@0__:expired" event channel : ' + r)
        
        sub.on('message', async (channel, expiredKey) => {
            console.log(`The shadow key ${expiredKey} expired`);
            const key = expiredKey.replace(SHADOW_KEY, '');
            let currentValue = await get(key);
            handler(channel, key, currentValue);
            client.del(key);

        });
    })
}

export async function incrementBy(key, incrementAmount) {
    return new Promise((resolve, rej) => {
        client.incrby(key, incrementAmount, async (err, reply) => {
            resolve(Number.parseInt(await get(key)));
        });
    });
}

export async function get(key) {
    return new Promise((resolve, rej) => {
        client.get(key, (err, reply) => {
            resolve(reply);
        });
    });
}

export async function setEx(key, expireSeconds, value) {
    return new Promise((resolve, rej) => {
        client.setex(key, expireSeconds, value, async (err, reply) => {
            resolve(reply);
        });
    });
}

export async function set(key, value) {
    return new Promise((resolve, rej) => {
        client.set(key, value, (err, reply) => {
            resolve(reply);
        });
    });
}
