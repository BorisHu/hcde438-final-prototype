#include <AdvancedSevenSegment.h>
AdvanceSevenSegment sevenSegment(3, 4, 5, 6, 7, 8, 9, 10);
int firstSensor = 0;    // first analog sensor
int secondSensor = 0;   // second analog sensor
int thirdSensor = 0;    // digital sensor
int inByte = 0;         // incoming serial byte

void setup() {
  // start serial port at 9600 bps and wait for port to open:
  Serial.begin(9600);
  Serial.setTimeout(10); // set the timeout for parseInt
  pinMode(2, INPUT);   // digital sensor is on digital pin 2
}

void loop() {
  int readingX = analogRead(A0);
  int readingY = analogRead(A1);
  int swi = digitalRead(2);
  Serial.print("[");
  Serial.print(readingX);
  Serial.print(",");
  Serial.print(readingY);
  Serial.print(",");
  Serial.print(swi);
  Serial.println("]");
  delay(100);

  if (Serial.available() > 0) {   // if there's serial data 
    int inByte = Serial.read(); // read it
    // Serial.write(inByte);  	// send it back out as raw binary data
    sevenSegment.setNumber(inByte);	// use it to set the LED brightness
  }
}
