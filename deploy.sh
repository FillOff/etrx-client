#!/bin/bash

docker build -t etrx-client .
docker run -itd --name etrx-client -p 3000:3000 etrx-client