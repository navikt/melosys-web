FROM docker.adeo.no:5000/lib/nginx:1.13.5
MAINTAINER Are Bjølseth <are.bjolseth@nav.no>

ENV LC_ALL="no_NB.UTF-8"
ENV LANG="no_NB.UTF-8"
ENV TZ="Europe/Oslo"

COPY build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
