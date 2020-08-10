FROM nginx:1.15.10-alpine

COPY dist /usr/share/nginx/html
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

