#!/bin/bash

APP_DIR="/home/tanmv/nodejs"

node $APP_DIR/daily_log/redis-backup.js 0 count_read_news_* redis-bak.json

node $APP_DIR/accountLevelDailyLog.js > $APP_DIR/log/accountLevelDaily.log
node $APP_DIR/activeUserDailyLog.js > $APP_DIR/log/activeUserDaily.log
node $APP_DIR/timeDailyLog.js > $APP_DIR/log/timeDaily.log
node $APP_DIR/gameModeDailyLog.js > $APP_DIR/log/gameModeDaily.log