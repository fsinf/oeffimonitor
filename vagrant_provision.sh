#!/bin/bash

cd /vagrant

###############################
# Get Docker + Docker-Compose #
###############################
# Check for updates only once per boot.
dpkg-query -W docker-ce docker-compose &>/dev/null || rm -f /tmp/apt_run_this_boot

if [ ! -f /tmp/apt_run_this_boot ]; then
    apt-get update
    apt-get install -y -q apt-transport-https

    wget -q "https://download.docker.com/linux/debian/gpg" -O - | apt-key add
    echo "deb https://download.docker.com/linux/debian stretch stable" > /etc/apt/sources.list.d/docker_com.list

    apt-get update
    apt-get install -y -q docker-ce docker-compose

    date -Isec > /tmp/apt_run_this_boot
fi

#############################
# remove running containers #
#############################
docker rm -f $(docker ps -aq) 2>/dev/null

###################
# (re)compose all #
###################
docker-compose up --build -d

###########
# cleanup #
###########
docker system prune --volumes -f
