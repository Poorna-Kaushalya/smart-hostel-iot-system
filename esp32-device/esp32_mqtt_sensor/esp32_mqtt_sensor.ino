#include <Arduino.h>
#include <math.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"

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
const float SENSITIVITY = 0.066;

float zeroVoltage = 0;
float energy_kWh = 0;
unsigned long lastEnergyTime = 0;
unsigned long lastPublishTime = 0;
const unsigned long publishInterval = 5000;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void connectMQTT() {
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);

  while (!mqttClient.connected()) {
    mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD);
    delay(1000);
  }
}

void calibrateACS() {
  float sum = 0;
  for (int i = 0; i < 500; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    sum += voltage;
    delay(2);
  }
  zeroVoltage = sum / 500.0;
}

float readCurrentRMS() {
  float sumSq = 0;

  for (int i = 0; i < 1000; i++) {
    int adc = analogRead(ACS_PIN);
    float voltage = adc * (ADC_REF / ADC_RES);
    float current = (voltage - zeroVoltage) / SENSITIVITY;
    sumSq += current * current;
    delayMicroseconds(200);
  }

  float Irms = sqrt(sumSq / 1000.0);

  if (Irms < 0.08) {
    Irms = 0.0;
  }

  return Irms;
}

float readMQ135Voltage() {
  int mqADC = analogRead(MQ135_PIN);
  return mqADC * (ADC_REF / ADC_RES);
}

int readPIR() {
  return digitalRead(PIR_PIN);
}

int readLDR() {
  int ldrADC = analogRead(LDR_PIN);
  return ldrADC > 2000 ? 1 : 0;
}

float readTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) return 0;
  return temp;
}

float readHumidity() {
  float hum = dht.readHumidity();
  if (isnan(hum)) return 0;
  return hum;
}

void updateEnergy(float power) {
  unsigned long now = millis();
  float hours = (now - lastEnergyTime) / 3600000.0;
  energy_kWh += (power * hours) / 1000.0;
  lastEnergyTime = now;
}

void publishSensorData() {
  float current = readCurrentRMS();
  float power = 230.0 * current;
  updateEnergy(power);

  float temp = readTemperature();
  float hum = readHumidity();
  float mqVolt = readMQ135Voltage();
  int pir = readPIR();
  int ldr = readLDR();

  StaticJsonDocument<256> doc;
  doc["roomId"] = ROOM_ID;
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

  Serial.print("Current(A): ");
  Serial.print(current, 3);
  Serial.print(" | Power(W): ");
  Serial.print(power, 2);
  Serial.print(" | Energy(kWh): ");
  Serial.print(energy_kWh, 5);
  Serial.print(" | Temp(C): ");
  Serial.print(temp);
  Serial.print(" | Humidity(%): ");
  Serial.print(hum);
  Serial.print(" | MQ135(V): ");
  Serial.print(mqVolt);
  Serial.print(" | PIR: ");
  Serial.print(pir);
  Serial.print(" | LDR: ");
  Serial.println(ldr);

  Serial.print("MQTT Payload: ");
  Serial.println(payload);
}

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
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    connectMQTT();
  }

  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastPublishTime >= publishInterval) {
    lastPublishTime = now;
    publishSensorData();
  }
}