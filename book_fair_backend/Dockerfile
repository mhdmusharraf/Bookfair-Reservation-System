# Use Maven image to build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /workspace

# Pre-copy the Maven descriptor to leverage Docker layer caching
COPY pom.xml ./
# Copy the source code
COPY src ./src

# Build the Spring Boot application
RUN mvn -B -DskipTests clean package

# Use a lightweight JRE for running the application
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the packaged JAR from the build stage
COPY --from=build /workspace/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Provide a hook for injecting custom JVM arguments
ENV JAVA_OPTS=""

# Run the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
