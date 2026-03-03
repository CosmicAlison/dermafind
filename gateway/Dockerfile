FROM openresty/openresty:alpine

RUN apk add --no-cache curl && \
    curl -o /usr/local/openresty/lualib/resty/http.lua \
    https://raw.githubusercontent.com/ledgetech/lua-resty-http/v0.17.1/lib/resty/http.lua && \
    curl -o /usr/local/openresty/lualib/resty/http_headers.lua \
    https://raw.githubusercontent.com/ledgetech/lua-resty-http/v0.17.1/lib/resty/http_headers.lua && \
    curl -o /usr/local/openresty/lualib/resty/http_connect.lua \
    https://raw.githubusercontent.com/ledgetech/lua-resty-http/v0.17.1/lib/resty/http_connect.lua



COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
EXPOSE 80
CMD ["openresty", "-g", "daemon off;"]