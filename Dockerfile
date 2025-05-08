FROM node:latest
 
ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
RUN npm install --force
RUN cd frontend && npm install --force && npm run build
CMD ["npm", "run", "serve"]