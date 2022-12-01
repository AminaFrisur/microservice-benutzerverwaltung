FROM mysql/mysql-server:8.0.31
LABEL description="Database of Microservice Benutzerverwaltung"

# Set working directory
WORKDIR ./Datenbank/

# Create the Database
RUN mkdir /mysql && mkdir /mysql/database && chmod 644 /mysql/database

COPY ./sqlData/data.sql /docker-entrypoint-initdb.d/

CMD ["mysqld"]