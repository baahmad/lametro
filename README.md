# LA Metro Real-time Display
See the real-time position of LA Metro displayed on a map of Los  Angeles.

## Prerequisites.
You need an API key from Swiftly. You can submit a request for a key at the bottom of the form [here](https://docs.goswift.ly/docs/realtime-standalone/d08fc97489edb-swiftly-api-reference). Once you have a token, add it to your local environment. For example, on my MacBook I added this to  `~/.zshrc`:
```
export LAMETRO_API_KEY=YOUR_KEY
```
Then run:
```
source ~/.zshrc
```

## How to Run.
You'll need to open two terminals. In one, navigate to `./backend` and run:
```
mvn spring-boot:run
```

In the other terminal, navigate to `./frontend` and run:
```
npm run dev
```

## Snapshot
TODO