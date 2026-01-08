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

output = {
    "features": geojson["features"],
    "stations": stations
}

with open('../frontend/src/data/railLines.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Generated GeoJSON with {len(geojson['features'])} rail lines and {len(stations)} stations")