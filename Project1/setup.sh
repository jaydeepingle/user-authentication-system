#!/bin/sh

#resync with repo 
sudo apt-get -y update

#set up for automatic unattended upgrades; important for security
sudo apt-get install -y unattended-upgrades

sudo apt-get install -y software-properties-common

#popular revision control system
sudo apt-get install -y git

#install packages which may be necessary in building native js modules
sudo apt-get install -y build-essential libssl-dev

#curl is a flexible network tool
sudo apt-get install -y curl

#add direct repository for nodejs-6.x
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

#install nodejs and npm
sudo apt-get install -y nodejs

#optional: install if you want to display X11 applications remotely
sudo apt-get install -y xauth

#optional: install emacs or any other editor you are comfortable with
sudo apt-get install -y emacs

#install gitlab continuous integration runner
sudo apt-get install -y gitlab-ci-multi-runner

#install a popular js test framework
sudo npm install -g mocha
 
#install mongodb
sudo apt-get install -y mongodb

