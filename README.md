Setup
=====

```shell
apt install certbot nodejs npm
npm install -g angular-http-server
certbot certonly
```

## HTTP -> HTTPS

1. Install Nginx

```shell
apt install nginx
```

2. Replace the contents of `/etc/nginx/sites-enabled/default ` with following

```
server {
    listen 80 default_server;

    server_name _;

    return 301 https://$host$request_uri;
}
```

3. Finally, restart Nginx

```shell
service nginx restart
```

Run
===

```shell
nohup angular-http-server -p 443 --https --key /etc/letsencrypt/live/morefriends.org/privkey.pem --cert /etc/letsencrypt/live/morefriends.org/fullchain.pem > log.txt 2> errors.txt < /dev/null &
PID=$!
echo $PID > pid.txt
```
