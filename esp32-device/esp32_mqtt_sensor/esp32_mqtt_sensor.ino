#include <Arduino.h>
#include <math.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"  // WiFi, MQTT, ROOM_ID, MQTT_TOPIC etc.

#define ACS_PIN 34
#define MQ135_PIN 33
#define DHT_PIN 17
#define PIR_PIN 16
#define LDR_PIN 35

#define DHTTYPE DHT22

DHT dht(DHT_PIN, DHTTYPE);
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

const float ADC_REF = 3.3;
const int ADC_RES = 4095;
const float SENSITIVITY = 0.066; // ACS sensor sensitivity (V/A)
const float ADAPTER_VOLTAGE = 12.0; // Your DC adapter voltage
const float MIN_CURRENT_THRESHOLD = 0.1; // Ignore currents below 0.1A

float zeroVoltage = 0;
float energy_kWh = 0;
unsigned long lastEnergyTime = 0;
unsigned long lastPublishTime = 0;
const unsigned long publishInterval = 5000; // 5 seconds

// Moving average
float currentAvg = 0.0;
const float alpha = 0.3; // smoothing factor (0-1)

// ======== WiFi & MQTT ========
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

void connectMQTT() {
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  Serial.print("Connecting MQTT");
  while (!mqttClient.connected()) {
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println(" Connected!");
    } else {
      Serial.print(".");
      delay(1000);
    }
  }
}

// ======== Sensor Calibration ========
void calibrateACS() {
  float sum = 0;
  for (int i = 0; i < 500; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    sum += voltage;
    delay(2);
  }
  zeroVoltage = sum / 500.0;
  Serial.print("ACS zeroVoltage: "); Serial.println(zeroVoltage, 5);
}

// ======== Sensor Readings ========
float readCurrentRMS() {
  float sumSq = 0;
  const int samples = 1000;
  for (int i = 0; i < samples; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    float current = (voltage - zeroVoltage) / SENSITIVITY;
    sumSq += current * current;
    delayMicroseconds(200);
  }
  float Irms = sqrt(sumSq / samples);

  // Avoid noise / unrealistic readings
  if (Irms < 0.05) Irms = 0.0;
  if (Irms > 30.0) Irms = 30.0;

  // Moving average
  currentAvg = (currentAvg * (1 - alpha)) + (Irms * alpha);
  return currentAvg;
}

float readMQ135Voltage() {
  int mqADC = analogRead(MQ135_PIN);
  return mqADC * (ADC_REF / ADC_RES);
}

int readPIR() { return digitalRead(PIR_PIN); }
int readLDR() { return analogRead(LDR_PIN) > 2000 ? 1 : 0; }

float readTemperature() {
  float temp = dht.readTemperature();
  return isnan(temp) ? 0 : temp;
}

float readHumidity() {
  float hum = dht.readHumidity();
  return isnan(hum) ? 0 : hum;
}

// ======== Energy Calculation ========
void updateEnergy(float power, bool adapterConnected) {
  unsigned long now = millis();
  float hours = (now - lastEnergyTime) / 3600000.0; // millis → hours
  if (adapterConnected) {
    energy_kWh += (power * hours) / 1000.0; // W → kWh
  }
  lastEnergyTime = now;
}

// ======== Publish Data ========
void publishSensorData() {
  float current = readCurrentRMS();
  bool adapterConnected = current >= MIN_CURRENT_THRESHOLD;
  float power = 0;

  if (adapterConnected) {
    power = current * ADAPTER_VOLTAGE;
    updateEnergy(power, true); // Only accumulate energy if adapter connected
  } else {
    // Adapter removed → zero current and power immediately
    current = 0.0;
    power = 0.0;
    updateEnergy(power, false); // Stop energy accumulation
  }

  // Other sensors read normally
  float temp = readTemperature();
  float hum = readHumidity();
  float mqVolt = readMQ135Voltage();
  int pir = readPIR();
  int ldr = readLDR();

  // Prepare JSON
  StaticJsonDocument<256> doc;
  doc["roomId"] = ROOM_ID;
  doc["adapterConnected"] = adapterConnected;
  doc["current"] = current;
  doc["power"] = power;
  doc["energy_kWh"] = energy_kWh;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["mq135Voltage"] = mqVolt;
  doc["pir"] = pir;
  doc["ldr"] = ldr;
  doc["timestamp"] = millis();

  char payload[256];
  serializeJson(doc, payload);
  mqttClient.publish(MQTT_TOPIC, payload);

  // Serial Output
  Serial.print("Adapter Connected: "); Serial.println(adapterConnected);
  Serial.print("Current(A): "); Serial.print(current, 3);
  Serial.print(" | Power(W): "); Serial.print(power, 2);
  Serial.print(" | Energy(kWh): "); Serial.print(energy_kWh, 5);
  Serial.print(" | Temp(C): "); Serial.print(temp);
  Serial.print(" | Humidity(%): "); Serial.print(hum);
  Serial.print(" | MQ135(V): "); Serial.print(mqVolt);
  Serial.print(" | PIR: "); Serial.print(pir);
  Serial.print(" | LDR: "); Serial.println(ldr);
  Serial.print("MQTT Payload: "); Serial.println(payload);
}

// ======== Setup & Loop ========
void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIR_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  delay(2000);
  calibrateACS();

  connectWiFi();
  connectMQTT();

  lastEnergyTime = millis();
  lastPublishTime = millis();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqttClient.connected()) connectMQTT();
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublishTime >= publishInterval) {
    lastPublishTime = now;
    publishSensorData();
  }
}