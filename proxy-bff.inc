# Cabeceras y tiempos para reenviar al BFF (se incluye desde nginx.conf).
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
# chatAgente puede tardar hasta unos 2 minutos (por defecto nginx espera 60 s).
proxy_read_timeout 150s;
proxy_send_timeout 150s;
# Las subidas van directo al BFF, sin guardarse antes en disco.
proxy_request_buffering off;
