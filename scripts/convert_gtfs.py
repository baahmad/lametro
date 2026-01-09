'''
This script pre-processes the rail shape and geometry provided by
LA Metro in order to display the rail lines on the map frontend.
'''

import csv
from collections import defaultdict
import json

def parse_csv(filepath):
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

# Create a dictionary with route information.
routes = parse_csv('../gtfs-data/routes.txt')
route_colors = {}
route_names = {}
for route in routes:
    route_colors[route['route_id']] = '#' + route['route_color']
    route_names[route['route_id']] = route['route_long_name']

# Create a dictionary with shape information. Note that multiple
# shapes can be associated with a single route.
shapes = parse_csv('../gtfs-data/shapes.txt')
shape_points = defaultdict(list)

for point in shapes:
    shape_id = point['shape_id']
    shape_points[shape_id].append({
        'seq': int(point['shape_pt_sequence']),
        'lat': float(point['shape_pt_lat']),
        'lon': float(point['shape_pt_lon'])
    })

# For each route, only hold onto the shape with the most points.
route_shapes = defaultdict(list)
for shape_id in shape_points:
    # Extract route ID using first 3 chars of the shape ID.
    route_id = shape_id[:3]
    if route_id not in route_shapes or len(shape_points[shape_id]) > len(shape_points[route_shapes[route_id]]):
        route_shapes[route_id] = shape_id

# Create a GeoJSON of the rail shapes for the frontend to consume.
geojson = {
    "type": "FeatureCollection",
    "features": []
}

for route_id, shape_id in route_shapes.items():
    points = sorted(shape_points[shape_id], key=lambda p: p['seq'])
    coordinates = [[p['lon'], p['lat']] for p in points]

    feature = {
        "type": "Feature",
        "properties": {
            "route_id": route_id,
            "name": route_names[route_id],
            "color": route_colors[route_id]
        },
        "geometry": {
            "type": "LineString",
            "coordinates": coordinates
        }
    }

    geojson["features"].append(feature)

geojson["features"].sort(key=lambda f: f["properties"]["name"])

# Parse rail stations.
stops = parse_csv('../gtfs-data/stops.txt')
stations = []
for stop in stops:
    if stop['location_type'] == '1':
        stations.append({
            'stop_id': stop['stop_id'],
            'name': stop['stop_name'],
            'lat': float(stop['stop_lat']),
            'lon': float(stop['stop_lon'])
        })

# Direction type for each route (north-south or east-west).
direction_types = {
    "801": "north-south",  # A Line
    "802": "east-west",    # B Line
    "803": "east-west",    # C Line
    "804": "east-west",    # D Line
    "806": "east-west",    # E Line
    "807": "north-south",  # K Line
}

for feature in geojson["features"]:
    route_id = feature["properties"]["route_id"]
    feature["properties"]["directionType"] = direction_types.get(route_id, "north-south")

# Parse trips to map trip_id to the route_id and direction_id.
trips = parse_csv('../gtfs-data/trips.txt')
trip_info = {}
for trip in trips:
    trip_info[trip['trip_id']] = {
        'route_id': trip['route_id'],
        'direction_id': int(trip['direction_id'])
    }

# Parse stop_times and group by trip_id.
stop_times = parse_csv('../gtfs-data/stop_times.txt')
trip_stops = defaultdict(list)

for st in stop_times:
    trip_stops[st['trip_id']].append({
        'stop_id': st['stop_id'],
        'sequence': int(st['stop_sequence'])
    })

# For each route/direction, find the trip with the most stops.
route_direction_trips = {}  # key: (route_id, direction_id), value: trip_id
for trip_id, stops_list in trip_stops.items():
    if trip_id not in trip_info:
        continue

    route_id = trip_info[trip_id]['route_id']
    direction_id = trip_info[trip_id]['direction_id']
    key = (route_id, direction_id)
    if key not in route_direction_trips or len(stops_list) > len(trip_stops[route_direction_trips[key]]):
        route_direction_trips[key] = trip_id

# Build stop sequences for each route/trip.
stop_name_lookup = {s['stop_id']: s['name'] for s in stations}

# Build a map of child stop_id -> parent station
stop_to_parent = {}
for stop in stops:
    if stop['parent_station']:
        stop_to_parent[stop['stop_id']] = stop['parent_station']
    else:
        stop_to_parent[stop['stop_id']] = stop['stop_id']

# Build stop sequences for each route/trip.
stop_sequences = {}
for (route_id, direction_id), trip_id in route_direction_trips.items():
    stops_list = sorted(trip_stops[trip_id], key=lambda s: s['sequence'])
    
    # Map stop_id to parent station using the lookup
    stop_sequence = []
    for stop in stops_list:
        parent_id = stop_to_parent.get(stop['stop_id'], stop['stop_id'] + 'S')
        if parent_id in stop_name_lookup:
            stop_sequence.append({
                'stop_id': parent_id,
                'name': stop_name_lookup[parent_id]
            })
    
    key = f"{route_id}_{direction_id}"
    stop_sequences[key] = stop_sequence

# Build a map of of the lines available at each station.
station_lines = defaultdict(list)
for key, stops in stop_sequences.items():
    route_id, direction_id = key.split('_')
    for stop in stops:
        stop_id = stop['stop_id']
        station_lines[stop_id].append({
            'route_id': route_id,
            'direction_id': int(direction_id)
        })

output = {
    "features": geojson["features"],
    "stations": stations,
    "stopSequences": stop_sequences,
    "stationLines": station_lines
}

with open('../frontend/src/data/railLines.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Generated GeoJSON with {len(geojson['features'])} rail lines, {len(stations)} stations, and {len(stop_sequences)} stop sequences")