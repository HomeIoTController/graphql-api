# Homer Controller - GraphQL API

This application is the main hub that connects with all available client applications: [audio-client](https://github.com/HomeIoTController/audio-client), [eeg-brainwave-client](https://github.com/HomeIoTController/eeg-brainwave-client) and [web-client](https://github.com/HomeIoTController/web-client) and enables commands to be processed. Having said that, this API mainly enables user registration, saving commands and running commands. Also, this GraphQL API connects with [eeg-brainwave-api](https://github.com/HomeIoTController/eeg-brainwave-api) through a Kafka Queue enabling brainwave data to be stored and classified.

Currently, commands are being processed and dispatched to a Philips HUE central hub, but this could be expanded to any IoT device.

## Getting Started

* To run this api just follow the steps on [compose](https://github.com/HomeIoTController/compose)

## How to create a new DB entity

* Example: `sequelize model:generate --name EEGData --attributes userId:integer,time:date,theta:integer,lowAlpha:integer,highAlpha:integer,lowBeta:integer,highBeta:integer,lowGamma:integer,midGamma:integer,attention:integer,meditation:integer,blink:integer --force`
