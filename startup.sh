#!/bin/bash

APP_DIR="/home/tanmv/nodejs"

tmux new-session -s "server" -n "web" -d
tmux send-keys -t "server" "cd $APP_DIR; node $APP_DIR/webserver.js" C-m
tmux new-window -n "socket" -t "server":1
tmux send-keys -t "server":1 "cd $APP_DIR; node $APP_DIR/websocket.js" C-m
tmux select-window -t "server":0
tmux attach -t "server"