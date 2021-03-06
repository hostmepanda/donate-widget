FROM node:lts-buster

RUN apt-get update && apt-get -y upgrade
RUN ln -sf /usr/share/zoneinfo/Europe/Moscow /etc/localtime
RUN mkdir -p /var/www/donate-widget
COPY src /var/www/donate-widget
COPY package.json /var/www/donate-widget
COPY yarn.lock /var/www/donate-widget
WORKDIR /var/www/donate-widget

CMD ["yarn", "install"]
CMD ["yarn", "start"]
