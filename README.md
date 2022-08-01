# waste-management-subscriber

[![Build Status](https://app.travis-ci.com/corlukantonio/waste-management-subscriber.svg?token=LFYd3nvNM4EhiD43TsCb&branch=main)](https://app.travis-ci.com/corlukantonio/waste-management-subscriber)

## Description

**Waste Management Subscriber** is an intermediary between the IoT device and the database. It connects to an MQTT broker and subscribes to specific topics on which packages arrive from IoT devices. Then it is the subscriber's responsibility to check the validity of each package as it arrives and store it in the database. The figure below shows where it is located in the system along with other components.

<p align="center">
  <img src="https://user-images.githubusercontent.com/32845849/182177663-59b6a74b-49cd-4e14-b37c-fad5b76c1534.png" alt="waste-management-cloud-scheme-v2-subscriber">
</p>

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
