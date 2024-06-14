## Pre-requirements / Versions

- DOCKER
- NODE version ^18.16
- NPM version ^9.5
- YARN version ^1.22
- MQTT BROKER = test.mosquitto.org

## Getting Started

First, setup the local database using Docker:

```bash
docker-compose up -d
```

Then install dependencies:

```bash
npm install
# or
yarn install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
```

The server is now running on [http://localhost:3009](http://localhost:3009).
You can now setup the [Webapp](http://localhost:3009).