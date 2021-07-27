import csv
import json

# Data URL: https://uhslc.soest.hawaii.edu/erddap/tabledap/global_hourly_fast.csvp?sea_level%2Ctime%2Clatitude%2Clongitude%2Cstation_name%2Cuhslc_id%2Cgloss_id%2Cssc_id&time%3E=2020-06-30T00%3A00%3A00Z&time%3C=2021-06-30T22%3A59%3A59Z
with open('raw_data/global_hourly_july_2020_to_june_2021.csv', 'r') as f:
    data = [x for x in csv.DictReader(f)]

stations = {}
station_fields = ['ssc_id', 'gloss_id', 'uhslc_id', 'station_name',
                  'latitude (degrees_north)', 'longitude (degrees_east)']

output_data = []
for row in data:
    # Add/replace station in station dict
    station_data = {field: row[field] for field in station_fields}
    station_data['lat'] = station_data.pop('latitude (degrees_north)')
    station_data['lon'] = station_data.pop('longitude (degrees_east)')
    stations[row['ssc_id']] = station_data

    # Extract slimmed down row
    final_row = {field: row[field] for field in list(row.keys(
    )) if field not in station_fields or field == "ssc_id"}

    output_data.append(final_row)


with open('processed_data/hourly_sealevel_data.csv', 'w') as f:
    out_csv = csv.DictWriter(f, fieldnames=list(output_data[0].keys()))
    out_csv.writeheader()

    for row in output_data:
        out_csv.writerow(row)

with open('processed_data/station_data.json', 'w') as f:
    json.dump(stations, f)


"https://uhslc.soest.hawaii.edu/erddap/tabledap/global_hourly_fast.csvp?sea_level%2Ctime%2Cssc_id&time%3E=2021-06-01T00%3A00%3A00Z&time%3C=2021-06-30T22%3A59%3A59Z"
