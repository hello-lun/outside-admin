# 使用官方的 Nginx 镜像作为基础
FROM nginx:latest

# 将你的前端资源复制到 Nginx 的默认托管目录
COPY . /usr/share/nginx/html/
