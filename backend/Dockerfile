# Этап 1: Сборка проекта (остается без изменений)
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Этап 2: Финальный образ (меняем alpine на обычный debian)
FROM eclipse-temurin:21-jre
WORKDIR /app

# Устанавливаем curl через стабильный apt-get
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java", "-Xmx350m", "-Xss512k", "-XX:MaxRAM=450m", "-jar", "app.jar"]