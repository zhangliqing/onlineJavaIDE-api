FROM node:7-onbuild
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN locale-gen zh_CN.UTF-8 &&\
  DEBIAN_FRONTEND=noninteractive dpkg-reconfigure locales
RUN locale-gen zh_CN.UTF-8
RUN apt-get update
RUN apt-get install default-jre default-jdk
ENV LANG zh_CN.UTF-8
ENV LANGUAGE zh_CN:zh
ENV LC_ALL zh_CN.UTF-8
EXPOSE 8080