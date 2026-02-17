# Astro App - React Native Frontend

A comprehensive astrology consultation platform built with React Native and Expo Router.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for mobile testing)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# For web development
npx expo start --web

# Clear cache if needed
npx expo start --clear
```

## 📱 App Structure

### User Interface
- **Home**: Browse astrologers and services
- **Call**: Voice consultations with astrologers
- **Messages**: Chat conversations
- **Horoscope**: Daily horoscope readings
- **Profile**: User profile management

### Mentor Interface
- **Dashboard**: Performance overview and statistics
- **Chat**: Client conversation management
- **Consultations**: Booking and session management
- **Earnings**: Revenue tracking and analytics
- **Profile**: Mentor profile and specializations
- **Settings**: Comprehensive preference management

## 🏗️ Technical Architecture

### Navigation
- **Expo Router**: File-based routing system
- **Tab Navigation**: Bottom tabs for main sections
- **Stack Navigation**: Screen transitions and modals

### State Management
- **React Context**: User authentication and global state
- **Local State**: Component-level state with useState/useEffect

### API Integration
- **REST APIs**: Communication with Spring Boot backend
- **Real-time Chat**: WebSocket integration for messaging
- **Authentication**: API key-based security

## 🎨 Design System

### Colors
- Primary Gold: `#FFD700`
- Secondary Orange: `#FFA500`
- Success Green: `#4CAF50`
- Error Red: `#FF4444`
- Background: `#F8F8F8`

### Components
- Gradient headers with golden theme
- Card-based layouts
- Professional mentor interface
- Responsive design for all screen sizes

## 🔧 Key Features

### Authentication
- User registration and login
- Profile management with real API integration
- Secure session management

### Chat System
- Real-time messaging with WebSocket
- Chat room creation and management
- Message persistence in database
- Professional mentor-client communication

### Mentor System
- Complete dashboard with analytics
- Client management and communication
- Settings and preference management
- Broadcast messaging capabilities
- Earnings and performance tracking

## 📁 Project Structure

```
MyAppName/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # User tab navigation
│   ├── auth/              # Authentication screens
│   ├── mentor/            # Mentor system
│   │   └── (tabs)/        # Mentor tab navigation
│   ├── chatbox.tsx        # User chat interface
│   └── _layout.tsx        # Root navigation
├── components/            # Reusable components
├── contexts/             # React Context providers
├── services/             # API service layer
├── config/               # Configuration files
└── constants/            # App constants
```

## 🌐 API Integration

### Backend Connection
- Base URL: `http://localhost:3000`
- API Key Authentication
- RESTful endpoints for all operations

### Key Services
- User management and authentication
- Chat room and messaging
- Astrologer data and services
- Profile updates and management

## 🧪 Development

### Available Scripts
```bash
# Start development server
npm start

# Start on specific platform
npx expo start --web
npx expo start --android
npx expo start --ios

# Clear Metro cache
npx expo start --clear

# Type checking
npx tsc --noEmit
```

### Environment Setup
1. Ensure backend is running on `http://localhost:3000`
2. Update API configuration in `config/auth.ts` if needed
3. Install Expo Go app for mobile testing

## 📱 Testing

### Web Testing
- Open `http://localhost:8081` in browser
- Full functionality available in web interface

### Mobile Testing
- Use Expo Go app to scan QR code
- Test on iOS Simulator or Android Emulator
- Real device testing via Expo Go

## 🔐 Security

### API Security
- API key authentication for all requests
- Secure headers and request validation
- User session management

### Data Protection
- Secure storage of user credentials
- Encrypted communication with backend
- Privacy controls for user data

## 🚀 Deployment

### Web Deployment
```bash
# Build for web
npx expo build:web

# Deploy build files to web server
```

### Mobile Deployment
```bash
# Build for app stores
npx expo build:android
npx expo build:ios
```

## 📊 Performance

### Optimization
- Lazy loading for screens
- Efficient state management
- Optimized API calls
- Image optimization and caching

### Monitoring
- Error tracking and logging
- Performance metrics
- User analytics integration

## 🤝 Contributing

1. Follow React Native best practices
2. Use TypeScript for type safety
3. Maintain consistent code formatting
4. Test on multiple platforms
5. Update documentation for new features

## 📞 Support

For technical issues:
1. Check the main documentation: `../ASTRO_APP_DOCUMENTATION.md`
2. Review API endpoints and integration guides
3. Test backend connectivity
4. Verify environment configuration

## 📄 License

Proprietary software. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Platform**: React Native with Expo Router