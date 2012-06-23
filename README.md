swmVoting
========

A simple voting client/server setup designed for a Startup Weekend event. It does not require an internet connection but does currently require something to handle IP addresses so clients can get to the computer running the server.

There is an admin login which allows someone to switch between a closed, open and voting state. These states allow the users to do nothing, enter project ideas and vote, respectively. 

Access is available on any device running an internet browser. The server just needs to be capable of running node.js and MongoDB. It'd be simple to point towards a MongoDB instance on the internet, but I wanted to be able to run everything on a local network in case of network outages.

## Requirements
Node.js
Express
Backbone.js
Socket.io

## Usage
Just start up a mongod instance and then the app.js node server and you should be good to go. 

## Future
There is still soem work to do and this is under semi-active development. Feel free to leave comment or suggest/make code changes!