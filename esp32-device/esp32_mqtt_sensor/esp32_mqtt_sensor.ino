#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <BH1750.h>
#include <math.h>
#include "config.h"

// ===== PINS =====
#define ACS_PIN 34
#define MQ135_PIN 32
#define DHT_PIN 17
#define PIR_PIN 16
#define DSM_PIN 26

#define DHTTYPE DHT22

DHT dht(DHT_PIN, DHTTYPE);
BH1750 lightMeter;

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

const float ADC_REF = 3.3;
const int ADC_RES = 4095;
const float ACS_SENSITIVITY = 0.066;

float zeroVoltage = 0;
bool bh1750Ready = false;

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
  mqttClient.setBufferSize(1024);

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

void calibrateACS() {
  float sum = 0;

  for (int i = 0; i < 500; i++) {
    float voltage = analogRead(ACS_PIN) * (ADC_REF / ADC_RES);
    sum += voltage;
    delay(2);
  }

  zeroVoltage = sum / 500.0;
}

float readCurrent() {
  float sumSq = 0;

  for (int i = 0; i < 500; i++) {
    float voltage = analogRead(ACS_PIN) * (ADC_REF / ADC_RES);
    float current = (voltage - zeroVoltage) / ACS_SENSITIVITY;
    sumSq += current * current;
    delayMicroseconds(200);
  }

  float current = sqrt(sumSq / 500.0);

  if (current < 0.20) current = 0;

  return current;
}

float readMQ135Voltage() {
  float total = 0;

  for (int i = 0; i < 10; i++) {
    total += analogRead(MQ135_PIN) * (ADC_REF / ADC_RES);
    delay(5);
  }

  return total / 10.0;
}

float readDustDensity() {
  unsigned long duration = pulseIn(DSM_PIN, LOW, 1000000);

  float ratio = duration / 10000.0;

  float concentration = 1.1 * pow(ratio, 3)
                      - 3.8 * pow(ratio, 2)
                      + 520 * ratio
                      + 0.62;

  float dust = concentration * 0.035;

  if (dust < 0) dust = 0;

  return dust;
}

float readLightLux() {
  if (!bh1750Ready) return -1;

  float lux = lightMeter.readLightLevel();

  if (lux < 0) return -1;

  return lux;
}

void publishSensorValues() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) temperature = -1;
  if (isnan(humidity)) humidity = -1;

  float mq135Voltage = readMQ135Voltage();
  float dustDensity = readDustDensity();
  float lightLux = readLightLux();
  int pir = digitalRead(PIR_PIN);
  float current = readCurrent();

  StaticJsonDocument<512> doc;

  doc["roomId"] = ROOM_ID;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["mq135Voltage"] = mq135Voltage;
  doc["dust_density_ug_m3"] = dustDensity;
  doc["light_intensity_lux"] = lightLux;
  doc["pir"] = pir;
  doc["current"] = current;
  doc["deviceTimestamp"] = millis();

  char payload[512];
  size_t payloadSize = serializeJson(doc, payload);

  bool sent = mqttClient.publish(MQTT_TOPIC, payload, payloadSize);

  Serial.print("MQTT Sent: ");
  Serial.println(sent ? "YES" : "NO");
  Serial.println(payload);
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  pinMode(PIR_PIN, INPUT);
  pinMode(DSM_PIN, INPUT);

  dht.begin();

  Wire.begin(21, 22);

  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23)) {
    bh1750Ready = true;
    Serial.println("BH1750 OK");
  } else {
    bh1750Ready = false;
    Serial.println("BH1750 failed");
  }

  calibrateACS();

  connectWiFi();
  connectMQTT();

  Serial.println("Sensor-only system started");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqttClient.connected()) connectMQTT();

  mqttClient.loop();

  publishSensorValues();

  delay(5000);
}