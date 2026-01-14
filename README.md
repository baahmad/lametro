# LA Metro Train Tracker
This website uses GTFS data from the LA Metro to show when trains will arrive at a selected station and when those trains will arrive at subsequent stations. I built this website because I live near a metro station and just want to know two things to determine when I should leave my apartment:
- When are the next trains at my local station arriving?
- If I get on one of those trains, when would it arrive at my desired station?

![Map showing LA Metro rail lines with real-time train positions](./screenshot.png)

## Key Features
### Real Time Data
The vehicle positions displayed on the map and the arrival times are populated from real time updates from the LA Metro.

### Bookmarkable
You can make a bookmark of the URL for a specific station, line, and direction. Useful if you only care about a handful of stations and direction.

### Desktop and Mobile Friendly
The mobile render of this website is swipe-friendly. Swipe on the left side of the screen to open the trip panel and right anywhere on the panel to close it.

## Tech Stack
- Frontend - React/Javascript
- Backend - Java (Spring Boot)
- Pre-processing scripts - Python

## Project Structure
```
lametro/
├── backend/    # Spring Boot API server
├── frontend/   # React application
└── scripts/    # Python scripts for GTFS data processing
```

## Running Locally
### Prerequisites
You need an API key from Swiftly. You can submit a request for a key at the bottom of the form [here](https://docs.goswift.ly/docs/realtime-standalone/d08fc97489edb-swiftly-api-reference). Once you have a token, add it to your local environment. For example, on my MacBook I added this to  `~/.zshrc`:
```
export LAMETRO_API_KEY=YOUR_KEY
```
Then run:
```
source ~/.zshrc
```

### How to Run
You'll need to open two terminals. In one, navigate to `./backend` and run:
```
mvn spring-boot:run
```

In the other terminal, navigate to `./frontend` and run:
```
npm run dev
```
Navigate to `http://localhost:5173` to view the website.

### How to Test
Use `npm test` in `./frontend` and `mvn test` in `./backend` to run the frontend and backend tests respectively.

## Data Attribution
Real-time transit data provided by [LA Metro](https://www.metro.net/) via the [Swiftly API](https://www.goswift.ly/).