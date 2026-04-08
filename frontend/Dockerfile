FROM nginx:alpine

COPY index.html style.css app.js /usr/share/nginx/html/

# Cloud Run exige escuchar en el puerto 8080 (sustituye la configuración por defecto en 80).
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
      'server {' \
      '    listen 8080;' \
      '    listen [::]:8080;' \
      '    server_name localhost;' \
      '    root /usr/share/nginx/html;' \
      '    index index.html;' \
      '    location / {' \
      '        try_files $uri $uri/ =404;' \
      '    }' \
      '}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Primer plano: el proceso principal del contenedor es Nginx (no daemon).
CMD ["nginx", "-g", "daemon off;"]
