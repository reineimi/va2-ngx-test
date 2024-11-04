#!/bin/bash
killall -q nginx;
alias resty='/usr/local/openresty/bin/resty';
alias nginx='/usr/local/openresty/nginx/sbin/nginx';
dir=$1;
if [ "$*" == "" ]; then
	printf 'Please specify working directory: ';
	read dir;
fi
nginx -p `pwd`/$dir -c conf/nginx.conf;
