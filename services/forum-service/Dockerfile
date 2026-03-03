# Use an official OpenJDK image
FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven build output
COPY target/*.jar app.jar

# Expose port your service uses
EXPOSE 8082

# Run the Spring Boot app
ENTRYPOINT ["java","-jar","app.jar"]