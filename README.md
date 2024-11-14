
# NSFWJS API

[![License](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/license/mit)
[![TypeScript](https://img.shields.io/badge/TypeScript-^5.6.3-blue)](https://www.typescriptlang.org/)

Encapsulate [NSFWJS](https://github.com/infinitered/nsfwjs) to provide an API for batch detection of images.

<br />

# Start

By default, the [InceptionV3](https://github.com/gantman/nsfw_model) model is used for detection, and some of the default configurations can be modified through the [.env](./.env.example) configuration file.

The timeout limit for **URL** requests can only be applied to `HTTPS` links, and `HTTP` URL link detection will wait indefinitely.It is recommended to obtain the content of the `HTTP` link yourself and use **Data** detection.

## Local

```shell
pnpm build && pnpm start
```

<br />

## Docker

```shell
# Build
docker buildx build -t nsfwjs-api:v3.0.0 --platform=linux/amd64 .

# Start
docker run -d --name nsfwjs-api \
    -p 0.0.0.0:3000:3000 \
    nsfwjs-api:v3.0.0
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
                "timeout": 10,
                "udid": "unique-id-1",
                "data": "https://example.com/image1.jpg"
            },
            {
                "timeout": 10,
                "udid": "unique-id-2",
                "data": "https://example.com/image2.jpg"
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

