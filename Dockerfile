FROM node:7-onbuild
RUN apt-get update
RUN apt-get install -y default-jre default-jdk
EXPOSE 8080