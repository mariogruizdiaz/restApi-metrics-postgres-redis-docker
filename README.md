# restApi-metrics-postgres-redis-docker

## Business Requirements

Please implement a scalable web service that accepts requests to increment a value associated with a given key. The service must synchronize its state to a Postgres database at least every ten seconds. Please do not spend more than six hours on this project.

### Basics

1. The service listens on port 3333 and accepts POST requests at the path /increment 
2. The request body is key and value in a JSON string with the format {“key”:
“<key_value>”, “value”: <increment>}. Both parameters are required. 
3. Requests increment the given key by the value indicated.
4. The persisted state must be, at most, ten seconds out of date.

5. ## Requisites for running the service

1. Docker Engine (for Mac, for Windows, or for Linux)
2. Yarn

## Service Description

The service provides the following endpoints

- /api/health
    - **GET** endpoint. It doesn't require a session
- /api/users
    - **POST** endpoint. For creating users. It requires to send into the body 'email" and "password" parameters.
- /api/sessions
    - **POST** endpoint for creating sessions. It requires to send into the body 'email" and "password" of a previously created user. As result, the session is inserted into the client app, in my case: The postman tool
    - **GET** endpoint for getting the userId of the session stored into the cookies after creating it with the POST endpoint.
    - **DELETE** endpoint for deleting the session received into the request cookies.
- /api/increment
    - **POST** endpoint for incrementing a given key by the also given value. The kay and value must be sent into the body of the request as a JSON object. The endpoint requires a valid session into the cookies.

A cache in-memory mechanism was implemented to prevent so many requests to the permanent database. Both databases are synchronized at key levels. This means that there is not a background process that scans all in-memory caches to define which values must be synchronized. Instead, I took advantage of the pub/sub mechanism provided by the in-memory cached to listen for the expired keys and only at that moment and only for that particular key, to update the permanent database.

Of course, the keys are inserted into the in-memory cached with 10 seconds of expiration time.

The service is instrumented to track metrics. They are consumed by Prometheus giving the user the opportunity to query them by using the integrated dashboard. In addition to that, I integrated Grafana on top of Prometheus to provide a better tool in terms of User Experience for metrics.

## Tech Stack

- NodeJs
- Javascript
- Postgres
- Redis
- Prometheus
- Grafana
- Docker

## Installation

1. In a terminal clone the repo: *git clone [git@github.com](mailto:git@github.com):mariogruizdiaz/restApi-metrics-postgres-redis-docker.git*
2. cd restApi-metrics-postgres-redis-docker
3. Execute: yarn docker:start
4. Enter to the shell of the service running in docker and execute the migration script to generate the database schema
    1. *docker-compose run appcues-marioruizdiaz bash*
    2. *yarn migrate up*

> That's it! You are ready to test and use the service.
> 

Once you have the service running, you can verify if the service is up by running the health endpoint.
![Untitled](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/867d3eb6-9f16-413a-877d-d1a5927fb28c)


## Side services included in the solution

In addition to the services running in port 3333, the following tools are also available

### Metrics in plain text

http://localhost:3333/metrics
![Untitled](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/c8663d17-6714-437f-8fde-c327b562f0dc)



### Prometheus

This side container read the instrumented metrics of the service

http://localhost:9090/graph?g0.expr=http_request_duration_seconds_count&g0.tab=1&g0.stacked=0&g0.show_exemplars=0&g0.range_input=1h

![Untitled](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/2d4711bb-a773-4f88-b06a-c82ac24a1ae2)

Add '*http_request_duration_seconds_count*' into the search input text and press 'Execute' button.

> user: admin
password: admin
> 

### Grafana

A really good user-friendly dashboard to watch metrics. In this case, it uses Prometheus as Datasource

http://localhost:3000/


![Untitled](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/de5c1cce-b721-42d7-9654-0377958ab316)

> user: admin
password: admin
> 

In order the have this dashboard, create a new one by doing the following:

![Untitled](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/c11a66e2-c8a1-4700-8335-1b6ceec7dfe8)


Click on Create → Dashboard


![Untitled (1)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/d8cf211b-0110-4889-9186-587609a0f3bc)

Click on 'Add an empty panel'

![Untitled (2)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/c181ec98-4c10-4a64-a300-6856401ac1c6)

Enter the text "http_request_duration_seconds_count' into the "Metrics browser" field and click outside.

And that's it. You can watch the metrics of our service

### All services running as docker instances

![Untitled (3)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/c125a646-7bad-45ed-9f43-eb518cca4722)

## Testing evidence

In order to use the increment endpoint, it is required to have a valid session. Since the session should be created by sending the email and password of an existing user, the first step requires creating a new user. 

<aside>
💡 User creation

</aside>

![Untitled (4)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/56afa047-9de7-4c62-87c8-d24ffe0d3afd)

<aside>
💡 Session creation

</aside>

![Untitled (5)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/000ad1df-d02f-482a-828d-dcf1cd35873b)

<aside>
💡 Query userid based on the session injected into the cookies

</aside>

![Untitled (6)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/03e0c098-1b58-4621-80d6-6f22f82795c6)

<aside>
💡 First post request to the 'increment' endpoint

</aside>

![Untitled (7)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/6af89709-887c-400d-8a58-dc493afaf44e)

<aside>
💡 Many requests to the 'increment' endpoint

</aside>

Even after 10 seconds the value continue increasing

![Untitled (8)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/9fcbb489-57dd-497c-859f-3385000c98e6)

 

![Untitled (9)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/06fa20c4-34fe-4a46-93b9-5693bd764501)

logs in the dockerized service terminal showing that the key expired a couple of times. In the code, you may see that the handlers update the database at that moment.

![Untitled (10)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/889cbb38-2ace-4d1e-9176-b376ee2a36b5)

<aside>
💡 Metrics

</aside>

![Untitled (11)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/7ff49733-9c1e-40b7-bec5-5b376e2c036e)

![Untitled (12)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/345ddc87-26b1-432d-a339-12762f2308b0)

![Untitled (13)](https://github.com/mariogruizdiaz/restApi-metrics-postgres-redis-docker/assets/24963928/7d896e74-603c-41ce-964c-49d1657e9684)

## Postmortem analysis

1. Did it go smoothly?
    
    <aside>
    💡 Not exactly, It took time for me to decide which kind of implementation to build considering that I wanted to provide fewer tech requisites, I also wanted to avoid launching cloud services if can provide the same in a standalone approach.
    
    </aside>
    
2. Any surprises or lessons learned?
    
    <aside>
    💡 To synchronize Redis with Postgres DB with the time constraint was not as easy that I thought.
    
    </aside>
    
    <aside>
    💡 I didn't want to fall into the easy approach of having a background process running every x secs to scan all Redis DB and to decide which key must be updated into the DB.
    
    </aside>
    
    <aside>
    💡 I prefer to implement a granular at key level update only when it is required. For this, I made usage of the pub/sub mechanism of Redis and the advantage of being able to define an expiration time for the keys.
    
    </aside>
    
    <aside>
    💡 I got the surprise that after implementing the pub/sub I was able to capture the moment in which a particular key expired, but I realized that Redis does not include the value. So I had to implement a complement mechanism for solving this situation. You can see the shadow kay that I am using for this.
    
    </aside>
    
3. What performance bottlenecks did you find?
    
    <aside>
    💡 The concurrence to the DB could be a problem when we have to escalate this service by creating many replicas of it.
    
    </aside>
    
4. Should we implement a production-ready version of what you built, or would you do things differently if it was going to production and you had more time?
    
    <aside>
    💡 I would move the Postgres DB to some cluster strategy, defining backup and disaster recovery strategy
    
    </aside>
    
    <aside>
    💡 I would move the Redis DB to a cluster mode strategy.
    
    </aside>
    
    <aside>
    💡 If the Postgres DB will have the same data that Redis, I would remove Postgres from the solution. Since Redis can work as a permanent DB too, it could provide both features, in-memory, and permanent storage.
    
    </aside>
    
    <aside>
    💡 I would write the unit tests with 100% of coverage
    
    </aside>
    
    <aside>
    💡 I would design and implement the infrastructure based on Kubernetes
    
    </aside>
    
    <aside>
    💡 I would design and implement the  CI as well as the CD for the services
    
    </aside>
    
    <aside>
    💡 I would design the IaC for the infrastructure relying on some framework like Terraform or Serverless.
    
    </aside>
    
    <aside>
    💡 I would complete the Observability implementation by adding Logs and Distributing Tracing to the Metrics.
    
    </aside>
    
    <aside>
    💡 I would implement more service metrics.
    
    </aside>
