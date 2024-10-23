[toc]

# NSFWJS API



<br />

# Start

## Local

```shell
pnpm build && pnpm start
```

<br />

## Docker

```shell
docker run -d --name nsfwjs-api \
    -p 0.0.0.:3000:3000 \
    nsfwjs-api:v2.0.0
```

<br />

# API

## URL

```shell
curl --location '127.0.0.1:3000/classify/url' \
    --header 'Content-Type: application/json' \
    --data '{
        "source": [
            {
                "udid": "unique-id-1",
                "data": "http://example.com/image1.jpg"
            },
            {
                "udid": "unique-id-2",
                "data": "http://example.com/image2.jpg"
            }
        ]
    }'
```

<br />

## Data

```shell
curl --location '127.0.0.1:3000/classify/data' \
    --header 'Content-Type: application/json' \
    --data '{
        "source": [
            {
                "udid": "unique-id-1",
                "data": "xxxxxxxxxxxxxxx"
            },
            {
                "udid": "unique-id-2",
                "data": "yyyyyyyyyyyyyyy"
            }
        ]
    }'
```

