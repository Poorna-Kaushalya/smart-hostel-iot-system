#include <Arduino.h>
#include <math.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"

// ======== PIN CONFIG ========
#define ACS_PIN 34
#define MQ135_PIN 33
#define DHT_PIN 17
#define PIR_PIN 16
#define LDR_PIN 35

#define DHTTYPE DHT22

DHT dht(DHT_PIN, DHTTYPE);
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

// ======== CONSTANTS ========
const float ADC_REF = 3.3;
const int ADC_RES = 4095;
const float SENSITIVITY = 0.066;
const float ADAPTER_VOLTAGE = 12.0;

// 🔥 IMPROVED THRESHOLDS
const float MIN_CURRENT_THRESHOLD = 0.5;
const float MQ135_MIN_THRESHOLD = 0.2;

// ======== VARIABLES ========
float zeroVoltage = 0;
float energy_kWh = 0;

unsigned long lastEnergyTime = 0;
unsigned long lastPublishTime = 0;
const unsigned long publishInterval = 5000;

// Moving average
float currentAvg = 0.0;
const float alpha = 0.3;

// ======== WIFI ========
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

// ======== MQTT ========
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

// ======== CALIBRATION ========
void calibrateACS() {
  float sum = 0;

  for (int i = 0; i < 500; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    sum += voltage;
    delay(2);
  }

  zeroVoltage = sum / 500.0;
  Serial.print("ACS zeroVoltage: ");
  Serial.println(zeroVoltage, 5);
}

// ======== CURRENT SENSOR ========
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

  // 🔥 NOISE FILTER
  if (Irms < 0.3) Irms = 0.0;
  if (Irms > 30.0) Irms = 30.0;

  // Moving average
  currentAvg = (currentAvg * (1 - alpha)) + (Irms * alpha);

  return currentAvg;
}

// ======== MQ135 SENSOR (FILTERED) ========
float readMQ135Voltage() {
  float total = 0;
  const int samples = 10;

  // Multiple readings for stability
  for (int i = 0; i < samples; i++) {
    int adc = analogRead(MQ135_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    total += voltage;
    delay(5);
  }

  float avgVoltage = total / samples;

  // 🔥 FILTER NOISE
  if (avgVoltage < 0.2) return 0.0;
  if (avgVoltage > 3.0) return 0.0;

  return avgVoltage;
}

// ======== OTHER SENSORS ========
int readPIR() {
  return digitalRead(PIR_PIN);
}

int readLDR() {
  return analogRead(LDR_PIN) > 2000 ? 1 : 0;
}

float readTemperature() {
  float t = dht.readTemperature();
  if (isnan(t)) return -1;
  return t;
}

float readHumidity() {
  float h = dht.readHumidity();
  if (isnan(h)) return -1;
  return h;
}

// ======== ENERGY ========
void updateEnergy(float power, bool adapterConnected) {
  unsigned long now = millis();
  float hours = (now - lastEnergyTime) / 3600000.0;

  if (adapterConnected) {
    energy_kWh += (power * hours) / 1000.0;
  }

  lastEnergyTime = now;
}

// ======== MAIN PUBLISH ========
void publishSensorData() {
  float current = readCurrentRMS();
  bool adapterConnected = current >= MIN_CURRENT_THRESHOLD;

  float power = 0;

  if (adapterConnected) {
    power = current * ADAPTER_VOLTAGE;
    updateEnergy(power, true);
  } else {
    current = 0.0;
    power = 0.0;
    updateEnergy(0, false);
  }

  float temp = readTemperature();
  float hum = readHumidity();

  float mqVolt = readMQ135Voltage();

  // 🔥 FINAL SAFETY CHECK
  if (mqVolt < 0.2 || mqVolt > 3.0) {
    mqVolt = 0.0;
  }

  int pir = readPIR();
  int ldr = readLDR();

  // ===== JSON =====
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

  // ===== SERIAL DEBUG =====
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

// ======== SETUP ========
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

// ======== LOOP ========
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