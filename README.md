# SmartSight MMM Platform

🚀 **Open-Source Marketing Mix Modeling Platform for SMBs and Enterprises**

SmartSight democratizes Marketing Mix Modeling by providing access to multiple industry-standard MMM models through an intuitive interface, making advanced marketing analytics accessible to businesses of all sizes.

## 🎯 Overview

SmartSight is a comprehensive MMM platform that supports multiple modeling approaches, allowing marketers to:
- **Train and compare** multiple MMM models simultaneously
- **Create ensemble models** for robust predictions
- **Analyze channel attribution** with confidence intervals
- **Optimize budget allocation** across marketing channels
- **Scenario plan** with predictive analytics

## 🧠 Supported MMM Models

### ✅ **Implemented Models (5)**

| Model | Provider | Type | Complexity | Training Time | Status |
|-------|----------|------|------------|---------------|---------|
| **LightweightMMM** | Google | Bayesian (JAX) | Medium | Medium | ✅ Implemented |
| **Meridian** | Google | Bayesian (TensorFlow) | High | Medium | ✅ Implemented |
| **Ridge Regression** | Custom | Linear Regression | Low | Fast | ✅ Implemented |
| **Robyn** | Meta | R-based MMM | High | Slow | ✅ Implemented |
| **PyMC-Marketing** | PyMC | Probabilistic | High | Slow | ✅ Implemented |

### 🔧 **Model Features**

- **Fallback Support**: All models include fallback implementations when dependencies are unavailable
- **Unified Interface**: Consistent API across all model types
- **Async Training**: Background processing with Celery
- **Model Comparison**: Statistical agreement analysis between models
- **Ensemble Creation**: Weighted combination of multiple models

## 🏗️ Architecture

### **Backend (Python FastAPI)**
```
backend/
├── app/
│   ├── mmm/                    # MMM model implementations
│   │   ├── base_model.py       # Abstract base class
│   │   ├── lightweight_mmm_model.py
│   │   ├── meridian_model.py
│   │   ├── ridge_regression_model.py
│   │   ├── robyn_model.py
│   │   ├── pymc_marketing_model.py
│   │   ├── model_factory.py    # Model creation factory
│   │   └── model_orchestrator.py # Multi-model training
│   ├── api/v1/endpoints/       # REST API endpoints
│   ├── models/                 # Database models
│   ├── schemas/                # Pydantic schemas
│   ├── crud/                   # Database operations
│   └── tasks/                  # Celery background tasks
```

### **Frontend (React + TypeScript)**
```
frontend/
├── src/
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Application pages
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API service layer
│   └── types/                  # TypeScript definitions
```

## 🚀 Quick Start

### **Prerequisites**
- Docker & Docker Compose
- Git

### **Installation**
```bash
# Clone the repository
git clone https://github.com/mahmoudkoura95/Devin-Smartsight-platform.git
cd Devin-Smartsight-platform

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### **Development Setup**
```bash
# Backend development
cd backend
poetry install
poetry run fastapi dev app/main.py

# Frontend development  
cd frontend
npm install
npm run dev
```

## 📊 API Endpoints

### **MMM Models**
- `GET /api/v1/models/available-models/info` - List available models
- `POST /api/v1/models/train` - Train multiple models
- `POST /api/v1/models/train-single` - Train single model
- `GET /api/v1/models/` - Get user's trained models
- `GET /api/v1/models/{model_id}/results` - Get model results

### **Model Comparison & Ensembles**
- `POST /api/v1/models/compare` - Compare multiple models
- `POST /api/v1/models/ensemble` - Create ensemble model
- `POST /api/v1/models/{model_id}/predict` - Scenario predictions

### **Data Management**
- `POST /api/v1/marketing-data/upload` - Upload marketing data
- `GET /api/v1/marketing-data/` - Get marketing data
- `POST /api/v1/auth/login` - User authentication

## 🔬 Model Capabilities

### **Training & Validation**
```python
# Example: Train multiple models
{
  "model_types": ["lightweight_mmm", "meridian", "robyn"],
  "config": {
    "hyperparameters": {...},
    "training_config": {...}
  }
}
```

### **Ensemble Analysis**
```python
# Example: Model agreement analysis
{
  "overall_agreement_score": 0.85,
  "channel_agreements": {
    "facebook": {"mean_attribution": 0.35, "variance": 0.02},
    "google": {"mean_attribution": 0.45, "variance": 0.01}
  },
  "interpretation": "high"
}
```

### **Scenario Planning**
```python
# Example: Budget scenario prediction
{
  "scenarios": [
    {"facebook_spend": 50000, "google_spend": 30000},
    {"facebook_spend": 40000, "google_spend": 40000}
  ]
}
```

## 🛠️ Tech Stack

### **Backend**
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Task Queue**: Celery with Redis
- **ML Libraries**: JAX, TensorFlow, PyMC, scikit-learn
- **R Integration**: rpy2 for Meta Robyn

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

### **Infrastructure**
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Alembic
- **Environment**: Python 3.11+, Node.js 18+

## 📈 Development Phases

### ✅ **Phase 1: Foundation** (Complete)
- Project structure and Docker setup
- User authentication and database models
- Basic API endpoints and frontend shell

### ✅ **Phase 2: Multi-Model MMM** (Complete)
- Implementation of all 5 MMM models
- Model training orchestration
- Ensemble and comparison capabilities
- Background task processing

### 🚧 **Phase 3: Advanced Analytics** (Next)
- Interactive dashboard and visualizations
- Advanced scenario planning
- Model performance monitoring
- Export and reporting features

### 🔮 **Phase 4: Enterprise Features** (Planned)
- Multi-tenant architecture
- Advanced user management
- API rate limiting and monitoring
- Production deployment guides

## 📚 Documentation

- **[MMM Models Guide](docs/MMM_MODELS.md)** - Detailed model documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** for LightweightMMM and Meridian frameworks
- **Meta** for the open-source Robyn MMM
- **PyMC** team for PyMC-Marketing
- **FastAPI** and **React** communities

## 📞 Support

- 📧 Email: mahmoudkoura95@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/mahmoudkoura95/Devin-Smartsight-platform/issues)
- 📖 Documentation: [Wiki](https://github.com/mahmoudkoura95/Devin-Smartsight-platform/wiki)

---

**Made with ❤️ for the marketing analytics community**
