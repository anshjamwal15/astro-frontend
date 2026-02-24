# Server Notification Payload Requirements

## Current Issue
Your server logs show successful FCM delivery, but notifications aren't appearing because the payload format needs both `notification` and `data` fields.

## Required Payload Structure

### Java/Spring Boot Example (Your Backend)

```java
import com.google.firebase.messaging.*;

public class NotificationService {
    
    pub