# MechaFix 🚗🔧

A comprehensive vehicle breakdown assistance platform that connects users with nearby mechanics for emergency roadside services.

## 📱 Features

### For Users
- **Emergency SOS**: Quick breakdown assistance with one-tap SOS button
- **Mechanic Discovery**: Find nearby mechanics based on location and breakdown type
- **Real-time Tracking**: Live location tracking of assigned mechanics
- **Service History**: Complete record of all service requests and ratings
- **Rating System**: Rate and review completed services
- **Multiple Breakdown Types**: Support for engine, brake, battery, and other issues

### For Mechanics
- **Service Management**: Accept, reject, and manage service requests
- **Worker Assignment**: Assign workers to specific service requests
- **OTP Verification**: Secure service completion verification
- **Performance Tracking**: Monitor ratings and service history
- **Availability Management**: Set service availability and working hours

### For Workers
- **Task Assignment**: Receive and manage assigned service requests
- **Navigation**: Built-in maps for easy location access
- **Service Completion**: OTP-based service verification
- **Customer Communication**: Direct calling and messaging capabilities

## 🏗️ Architecture

```
MechaFix/
├── frontend/                 # React Native mobile app
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── images/         # App assets
│   ├── android/            # Android-specific files
│   └── ios/                # iOS-specific files
├── backend/                 # Django backend
│   ├── users/              # User authentication & management
│   ├── mechanic/           # Mechanic & worker management
│   ├── mech_recommend/     # Service requests & recommendations
│   └── chatbot/            # AI-powered customer support
└── venv/                   # Python virtual environment
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>=18)
- Python (3.8+)
- MongoDB
- React Native CLI
- Android Studio / Xcode

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MechaFix
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URL=mongodb://localhost:27017
   MONGO_DB_NAME=mechafix
   SECRET_KEY=your-secret-key
   ORS_API_KEY=your-openrouteservice-api-key
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Start the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **iOS setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 📱 Mobile App Features

### Core Components

#### **UserHome.jsx**
- Main dashboard for users
- SOS button for emergency assistance
- Active service request tracking
- Service history overview

#### **WorkerPage.jsx**
- Worker assignment management
- OTP verification for service completion
- Customer information display
- Integrated Google Maps navigation

#### **RatingModal.jsx**
- Service rating interface (1-5 stars)
- Comment submission
- Beautiful gradient design matching app theme

#### **SOS.jsx**
- Emergency breakdown assistance
- Location-based mechanic discovery
- Real-time service request creation

### Navigation Structure
```
App
├── SplashScreen
├── UserTypeSelection
├── Login/SignUp
├── Main App
│   ├── UserHome
│   ├── Breakdown
│   ├── FoundMechanic
│   ├── TrackingMap
│   ├── CustomerHistory
│   └── Profile
└── WorkerPage (for mechanics)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/users/signup/` - User registration
- `POST /api/users/login/` - User login
- `GET /api/users/me/` - Get current user profile

### Service Requests
- `POST /api/service-request/` - Create new service request
- `GET /api/pending-requests/` - Get pending requests
- `GET /api/assigned-requests/` - Get assigned requests
- `POST /api/verify-otp-complete/` - Complete service with OTP

### Mechanic Management
- `GET /api/mechanic/workers/` - Get garage workers
- `POST /api/mechanic/workers/` - Add new worker
- `PATCH /api/mechanic/workers/<id>/` - Update worker
- `DELETE /api/mechanic/workers/<id>/` - Remove worker

### Ratings & Reviews
- `POST /api/submit-rating/` - Submit service rating
- `GET /api/service-requests/completed/` - Get completed services

### Recommendations
- `POST /api/recommendations/` - Get mechanic recommendations
- `GET /api/mechanics/` - Get mechanics list

## 🗄️ Database Schema

### Collections

#### **auth_mech** (Mechanics/Garage Owners)
```json
{
  "_id": "ObjectId",
  "username": "string",
  "garage_name": "string",
  "email": "string",
  "phone": "string",
  "location": {
    "lat": "number",
    "lon": "number"
  },
  "services": ["array"],
  "rating": "number",
  "created_at": "date"
}
```

#### **mech_worker** (Individual Workers)
```json
{
  "_id": "ObjectId",
  "garage_name": "string",
  "garage_id": "string",
  "name": "string",
  "phone": "string",
  "rating": "number",
  "total_ratings": "number",
  "ratings": ["array"],
  "created_at": "date"
}
```

#### **find_mech** (Service Ratings)
```json
{
  "_id": "ObjectId",
  "mech_name": "string",
  "mech_lat": "number",
  "mech_long": "number",
  "rating": "number",
  "comment": "string",
  "breakdown_type": "string",
  "user_name": "string",
  "user_phone": "string",
  "car_details": "string",
  "service_type": "string",
  "request_id": "string",
  "created_at": "date"
}
```

#### **service_requests** (Service Requests)
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "user_name": "string",
  "user_phone": "string",
  "breakdown_type": "string",
  "car_model": "string",
  "license_plate": "string",
  "lat": "number",
  "lon": "number",
  "address": "string",
  "status": "string",
  "mechanics_list": ["array"],
  "assigned_worker": "object",
  "otp_code": "string",
  "created_at": "date",
  "completed_at": "date"
}
```

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: `#6C63FF` (Purple)
- **Secondary**: `#FF4D4F` (Red)
- **Background**: `#F6F8FF` (Light Blue)
- **Header Gradient**: `#f7cac9` → `#f3e7e9` → `#a1c4fd`

### Design Principles
- Clean, modern interface
- Intuitive navigation
- Consistent color scheme
- Responsive design
- Accessibility focused

## 🔒 Security Features

- JWT-based authentication
- OTP verification for service completion
- Input validation and sanitization
- Secure API endpoints
- Role-based access control

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📱 Platform Support

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **Backend**: Cross-platform (Windows, macOS, Linux)

## 🚀 Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure production database
3. Set up reverse proxy (nginx)
4. Use production WSGI server (gunicorn)

### Frontend Deployment
1. Build production APK/IPA
2. Sign with appropriate certificates
3. Deploy to app stores or internal distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added rating system and worker management
- **v1.2.0** - Enhanced UI and performance improvements

## 📊 Performance Metrics

- **App Size**: ~25MB (Android), ~30MB (iOS)
- **Startup Time**: <3 seconds
- **API Response Time**: <500ms average
- **Battery Usage**: Optimized for minimal impact

---

**Built with ❤️ by the MechaFix Team** 