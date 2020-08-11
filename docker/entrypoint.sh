#!/usr/bin/env sh

echo -e "{
    \"server\": {
        \"ssl\": $SERVER_SSL,
        \"domain\": \"$SERVER_DOMAIN\",
        \"port\": $SERVER_PORT,
        \"contextPath\": \"$SERVER_CONTEXT_PATH\",
        \"wsDomain\": \"$SERVER_WS_DOMAIN\"
    },
    \"contextPath\": \"$CONTEXT_PATH\",
    \"preferLoginWith\": $PREFER_LOGIN_WITH
}" > /usr/share/nginx/html/webapp.properties.json

cat  /usr/share/nginx/html/webapp.properties.json

/usr/sbin/nginx -g "daemon off;"

