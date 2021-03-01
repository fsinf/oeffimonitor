#!/bin/sh

podman-compose build
podman push registry.ionic.at/oeffimonitor
