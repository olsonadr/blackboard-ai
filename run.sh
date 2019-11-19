#!/bin/bash

## Sources
source ./utils/functions

## Print Header
printf '=---------------------------'

## Get Port
if [ "$1" == "" ]
then
    printf '\n'
    input "Server port to use... " port
else
    port=$1;
fi

## Print Port
printf '\nServer will run on port '
echo $port

## Launch Server
if [ "$port" == "" ]
then
    printf 'Please pass desired PORT as command-line argument!\n'
else
    printf 'Launching server...\n=---------------------------\n\n'
    PORT=$port node ./scripts/server/server.js
    printf '\n=---------------------------\nServer closed...'
fi

##Print Footer
printf '\n=---------------------------\n'
