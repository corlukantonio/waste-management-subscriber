# waste-management-subscriber

[![Node.js CI](https://github.com/corlukantonio/waste-management-subscriber/actions/workflows/ci.yml/badge.svg)](https://github.com/corlukantonio/waste-management-subscriber/actions/workflows/ci.yml)
[![Build Status](https://app.travis-ci.com/corlukantonio/waste-management-subscriber.svg?token=LFYd3nvNM4EhiD43TsCb&branch=main)](https://app.travis-ci.com/corlukantonio/waste-management-subscriber)
![GitHub commits since tagged version](https://img.shields.io/github/commits-since/corlukantonio/waste-management-subscriber/v1.0.1/main)

## Description

**Waste Management Subscriber** is an intermediary between the IoT device and the database. It connects to an MQTT broker and subscribes to specific topics on which packages arrive from IoT devices. Then it is the subscriber's responsibility to check the validity of each package as it arrives and store it in the database. The figure below shows where it is located in the system along with other components.

<p align="center">
  <img src="https://user-images.githubusercontent.com/32845849/184077263-d49a5d45-20a9-4ba7-a0cf-7fc22680585c.png" alt="waste-management-cloud-scheme-v3">
</p>

<p align="center">
  <i><b>Figure 1.</b> - Waste Management System</i>
</p>

Video goes here...

## Environment variables

The environment variables required for this application are listed and described below.

<table align="center">
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>WMS_DB_HOST</td>
      <td>Database host.</td>
    </tr>
    <tr>
      <td>WMS_DB_NAME</td>
      <td>Database name.</td>
    </tr>
    <tr>
      <td>WMS_DB_PASSWORD</td>
      <td>Database password.</td>
    </tr>
    <tr>
      <td>WMS_DB_USER</td>
      <td>Database user.</td>
    </tr>
    <tr>
      <td>WMS_MQTT_BROKER_PASSWORD</td>
      <td>MQTT broker password.</td>
    </tr>
    <tr>
      <td>WMS_MQTT_BROKER_PORT</td>
      <td>MQTT broker port.</td>
    </tr>
    <tr>
      <td>WMS_MQTT_BROKER_URL</td>
      <td>MQTT broker URL.</td>
    </tr>
    <tr>
      <td>WMS_MQTT_BROKER_USER</td>
      <td>MQTT broker user.</td>
    </tr>
  </tbody>
</table>

## How to run it?

Before you start doing any of the following, make sure you have [**Node.js**](https://nodejs.org) installed either on your computer or the server on which you're going to run the application.

### Installing node modules

When done with git repository cloning, navigate to the waste-management-subscriber and run next command to install **node modules** on the server:

```properties
npm install
```

### And finally, run it!

Navigate to the socialnet, and start the web application by typing:

```properties
npm start
```
