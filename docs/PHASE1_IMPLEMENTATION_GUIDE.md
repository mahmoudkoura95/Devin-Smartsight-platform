# Phase 1 Implementation Guide - SmartSight MMM Platform

## 🎯 Phase 1 Objectives

Phase 1 establishes the foundational architecture for SmartSight, creating a solid base for the multi-model MMM platform.

### Key Deliverables
- ✅ Project structure and development environment
- ✅ FastAPI backend with JWT authentication
- ✅ React TypeScript frontend with component library
- ✅ PostgreSQL database schema
- ✅ Docker containerization for development

## 🏗️ Architecture Overview

### Backend (FastAPI + PostgreSQL)
- **Authentication**: JWT-based with refresh tokens
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Background Tasks**: Celery with Redis
- **API Documentation**: Auto-generated with FastAPI

### Frontend (React + TypeScript)
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom Hooks
- **Charts**: Chart.js and D3.js for visualizations

### Infrastructure
- **Development**: Docker Compose
- **Database**: PostgreSQL 14
- **Cache/Queue**: Redis 7
- **Process Management**: Celery workers

## 📋 Implementation Steps

### Step 1: Backend Foundation

#### 1.1 FastAPI Application Setup
```python
# app/main.py - Main FastAPI application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="SmartSight MMM API",
    description="Marketing Mix Modeling Platform API",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
```

#### 1.2 Database Models
```python
# app/models/user.py - User model
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### 1.3 Authentication System
```python
# app/core/auth.py - JWT authentication
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### Step 2: Frontend Foundation

#### 2.1 React Application Structure
```
frontend/src/
├── components/
│   ├── ui/           # Basic UI components
│   ├── layout/       # Navigation, headers, sidebars
│   ├── charts/       # Data visualization components
│   └── forms/        # Form components
├── pages/
│   ├── auth/         # Login, register pages
│   ├── dashboard/    # Main dashboard
│   └── settings/     # User settings
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── types/            # TypeScript interfaces
├── services/         # API integration
└── utils/            # Helper functions
```

#### 2.2 Authentication Context
```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication logic here
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2.3 API Service Layer
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Step 3: Database Schema Design

#### 3.1 Core Tables
```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dashboard_mode VARCHAR(50) DEFAULT 'autopilot', -- 'autopilot' or 'copilot'
    default_date_range INTEGER DEFAULT 90,
    preferred_models JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Data Storage
CREATE TABLE marketing_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL, -- 'meta', 'google', 'tiktok', 'manual'
    date DATE NOT NULL,
    channel VARCHAR(100) NOT NULL,
    campaign_name VARCHAR(255),
    spend DECIMAL(12,2),
    impressions BIGINT,
    clicks BIGINT,
    conversions INTEGER,
    revenue DECIMAL(12,2),
    data_quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2 Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_marketing_data_user_date ON marketing_data(user_id, date);
CREATE INDEX idx_marketing_data_source ON marketing_data(source);
CREATE INDEX idx_marketing_data_channel ON marketing_data(channel);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

### Step 4: Docker Development Environment

#### 4.1 Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev

# Copy application code
COPY . .

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 4.2 Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## 🧪 Testing Strategy

### Backend Testing
```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_registration():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    assert "access_token" in response.json()
```

### Frontend Testing
```typescript
// src/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

test('renders login form', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

## 🚀 Deployment Instructions

### Development Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd smartsight-platform

# 2. Copy environment variables
cp .env.example .env

# 3. Start development environment
docker-compose up -d

# 4. Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Verification Steps
1. **Database Connection**: Check that PostgreSQL is running and accessible
2. **Backend API**: Visit http://localhost:8000/docs for interactive API documentation
3. **Frontend Application**: Access http://localhost:3000 and verify React app loads
4. **Authentication Flow**: Test user registration and login
5. **API Integration**: Verify frontend can communicate with backend

## 📊 Success Criteria

### Technical Metrics
- ✅ All Docker containers start without errors
- ✅ Database migrations run successfully
- ✅ API endpoints respond with correct status codes
- ✅ Frontend loads without console errors
- ✅ Authentication flow works end-to-end

### User Experience
- ✅ Clean, responsive interface design
- ✅ Intuitive navigation and user flow
- ✅ Clear error messages and feedback
- ✅ Fast page load times (< 3 seconds)

### Code Quality
- ✅ TypeScript types for all interfaces
- ✅ Comprehensive error handling
- ✅ Unit tests for critical functionality
- ✅ Clear code documentation
- ✅ Consistent coding standards

## 🔧 Troubleshooting

### Common Issues

#### Docker Container Issues
- **Port conflicts**: Change port mappings in docker-compose.yml
- **Memory issues**: Increase Docker memory allocation
- **Volume mounting**: Check file permissions and paths

#### Database Connection Problems
- **Connection refused**: Check PostgreSQL service status
- **Authentication failures**: Verify credentials in .env file
- **Migration errors**: Check for schema conflicts

#### Frontend Build Issues
- **Dependency conflicts**: Clear node_modules and reinstall
- **TypeScript errors**: Check type definitions and imports
- **Runtime errors**: Check browser console for details

### Debug Commands
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Access database directly
docker exec -it smartsight-db psql -U smartsight_user -d smartsight

# Restart specific service
docker-compose restart backend
```

## 🚀 Next Steps

After completing Phase 1, you'll be ready for:

1. **Phase 2**: Multi-Model MMM Implementation
   - Google LightweightMMM integration
   - Model comparison framework
   - Data quality assessment

2. **Phase 3**: Advanced Analytics
   - External factors integration
   - Scenario planning
   - AI-powered recommendations

3. **Phase 4**: Enterprise Features
   - Real-time API integrations
   - Advanced reporting
   - Production deployment

---

**Phase 1 Status**: ✅ Foundation Complete - Ready for MMM Implementation
