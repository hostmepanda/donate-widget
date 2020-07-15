FROM node:lts-buster

RUN apt-get update && apt-get -y upgrade
RUN ln -sf /usr/share/zoneinfo/Europe/Moscow /etc/localtime
RUN mkdir -p /var/www/donate-widget
ADD . /var/www/donate-widget
WORKDIR /var/www/donate-widget

CMD ["yarn", "install"]
CMD ["yarn", "start"]
