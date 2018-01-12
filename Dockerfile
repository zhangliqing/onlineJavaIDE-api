FROM node:7-onbuild
RUN apt-get update
RUN apt-get install -y default-jre default-jdk
ENV LANG C.UTF-8
EXPOSE 8080