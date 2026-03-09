# Usamos una imagen ligera de Nginx
FROM nginx:alpine

# Copiamos tus archivos HTML a la carpeta donde Nginx los busca
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el estándar web)
EXPOSE 80
