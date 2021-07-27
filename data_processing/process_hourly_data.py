import csv
import json

# Data URL: https://uhslc.soest.hawaii.edu/erddap/tabledap/global_hourly_fast.csvp?sea_level%2Ctime%2Clatitude%2Clongitude%2Cstation_name%2Cuhslc_id%2Cgloss_id%2Cssc_id&time%3E=2020-06-30T00%3A00%3A00Z&time%3C=2021-06-30T22%3A59%3A59Z
with open('raw_data/global_hourly_june_2021.csv', 'r') as f:
    data = [x for x in csv.DictReader(f)]

stations = {}
station_fields = ['ssc_id', 'gloss_id', 'uhslc_id', 'station_name',
                  'latitude (degrees_north)', 'longitude (degrees_east)']

output_data = []
for row in data:
    # Add/replace station in station dict
    station_data = {field: row[field] for field in station_fields}

    station_data['lat'] = float(station_data.pop('latitude (degrees_north)'))
    station_data['lng'] = float(station_data.pop('longitude (degrees_east)'))
    station_data['lng'] = (
        station_data['lng'] - 360 if station_data['lng'] > 180 else station_data['lng'])

    stations[row['ssc_id']] = station_data

    # Extract slimmed down row
    final_row = {field: row[field] for field in list(row.keys(
    )) if field not in station_fields or field == "ssc_id"}

    final_row['time'] = final_row.pop('time (UTC)')
    final_row['sea_level'] = final_row.pop('sea_level (millimeters)')

    if final_row['time'][-6:-4] == "59":
        new_hour = int(final_row['time'][-9:-7])
        final_row['time'] = final_row['time'][:-9] + \
            str(((int(final_row['time'][-9:-7]) + 1) %
                24)).zfill(2) + ':00:00Z'
    final_row['time']

    output_data.append(final_row)


with open('processed_data/hourly_sealevel_data.csv', 'w') as f:
    out_csv = csv.DictWriter(f, fieldnames=list(output_data[0].keys()))
    out_csv.writeheader()

    for row in output_data:
        out_csv.writerow(row)

with open('processed_data/station_data.json', 'w') as f:
    json.dump(stations, f)


"https://uhslc.soest.hawaii.edu/erddap/tabledap/global_hourly_fast.csvp?sea_level%2Ctime%2Cssc_id&time%3E=2021-06-01T00%3A00%3A00Z&time%3C=2021-06-30T22%3A59%3A59Z"
