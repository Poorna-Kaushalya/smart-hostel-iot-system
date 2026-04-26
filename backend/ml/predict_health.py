import sys
import json
import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "environmental_health_rf_model.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "environmental_health_label_encoder.pkl"))

data = json.loads(sys.argv[1])

temperature = float(data.get("temperature", 0))
humidity = float(data.get("humidity", 0))
air_quality_ppm = float(data.get("air_quality_ppm", 0))
dust_density_ug_m3 = float(data.get("dust_density_ug_m3", 0))
light_intensity_lux = float(data.get("light_intensity_lux", 0))
hour = int(data.get("hour", 0))

df = pd.DataFrame([{
    "temperature": temperature,
    "humidity": humidity,
    "air_quality_ppm": air_quality_ppm,
    "dust_density_ug_m3": dust_density_ug_m3,
    "light_intensity_lux": light_intensity_lux,
    "temp_humidity_index": temperature * humidity / 100,
    "air_dust_index": air_quality_ppm + dust_density_ug_m3,
    "light_comfort_gap": abs(light_intensity_lux - 400),
    "hour": hour
}])

feature_cols = [
    "temperature",
    "humidity",
    "air_quality_ppm",
    "dust_density_ug_m3",
    "light_intensity_lux",
    "temp_humidity_index",
    "air_dust_index",
    "light_comfort_gap",
    "hour"
]

df = df[feature_cols]

prediction = model.predict(df)
label = label_encoder.inverse_transform(prediction)[0]

score_map = {
    "Healthy": 90,
    "Moderate": 65,
    "Unhealthy": 40
}

print(json.dumps({
    "environmental_health": label,
    "health_score": score_map.get(label, 50)
}))