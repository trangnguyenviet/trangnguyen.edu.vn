#!/bin/bash

MONGO_DATABASE="trangnguyen"
MONGO_HOST="10.0.0.200"
MONGO_PORT="27017"
LOG_FILE="log-dump.log"
TIMESTAMP="$(date +'%Y%m%d%H%M%S')"
MONGODUMP_PATH="/usr/bin/mongodump"
BACKUPS_DIR="/home/tanmv/db"

mkdir -p $BACKUPS_DIR

echo "Starting backup db: $MONGO_DATABASE at $TIMESTAMP, please wait..."
$MONGODUMP_PATH --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DATABASE --out $BACKUPS_DIR/$TIMESTAMP/
echo "backup done!"
TIME_FULL="$(date +'%Y-%m-%d %H:%M:%S')"
echo "[$TIME_FULL] [mongodump] $MONGO_DATABASE => $BACKUPS_DIR/$TIMESTAMP" >> $BACKUPS_DIR/$LOG_FILE

echo "compress..."
7z a $BACKUPS_DIR/$TIMESTAMP.7z $BACKUPS_DIR/$TIMESTAMP
rm -rf $BACKUPS_DIR/$TIMESTAMP
echo "done all! save to $BACKUPS_DIR/$TIMESTAMP.7z"

TIME_FULL="$(date +'%Y-%m-%d %H:%M:%S')"
echo "[$TIME_FULL] [7z] compress $MONGO_DATABASE => $BACKUPS_DIR/$TIMESTAMP.7z" >> $BACKUPS_DIR/$LOG_FILE

find $BACKUPS_DIR -mtime +7 -exec rm {} \;