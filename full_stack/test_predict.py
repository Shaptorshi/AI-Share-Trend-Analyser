import urllib.request
import json

url = "http://127.0.0.1:8000/api/predict/"
data = {
    "symbol": "RELIANCE.NS",
    "current_price": 1359.69,
    "prices_30d": [1363.3, 1353.3, 1362.09, 1343.4, 1327.8, 1365.8, 1388.9, 1425.4, 1430.8, 1430.8, 1463.09, 1463.59, 1437.9, 1436.19, 1435.19, 1388.19, 1364.0, 1358.8, 1361.8, 1336.4, 1335.9, 1322.69, 1359.69],
    "volumes_30d": [13614733, 27293629, 9525953, 16385079, 11744802, 24673098, 41027699, 30542143, 30957881, 0, 24035700, 23543341, 14221786, 19816903, 8663105, 15261787, 24357500, 13797989, 17303059, 19976192, 13022473, 21665501, 13247462]
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Error:", e.code)
    print(e.read().decode('utf-8'))
