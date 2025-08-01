#include <DHT.h>

#define DHTPIN 2       // Pino de dados do DHT11
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  if (!isnan(temperatura)) {
    Serial.println(temperatura);
  } else {
    Serial.println("Erro na leitura");
  }
  delay(60000); // Espera 1 minuto
}
