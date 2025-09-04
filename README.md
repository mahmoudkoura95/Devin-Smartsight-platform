# SmartSight MMM Platform

**Open-Source Marketing Mix Modeling for Everyone**

SmartSight democratizes advanced Marketing Mix Modeling (MMM) by providing an intuitive platform that leverages multiple open-source AI models to help businesses understand which marketing channels truly drive results.

## 🎯 Vision

Transform marketing attribution from an enterprise-only capability to an accessible tool for SMBs and marketers worldwide.

## 🏗️ Architecture

### Dual-Mode Experience
- **Autopilot Mode**: Simplified, guided experience for SMB users
- **Co-Pilot Mode**: Advanced analytics for enterprise users and data scientists

### Multi-Model Approach
- **Meta's Robyn**: Bayesian MMM with business priors
- **Google's LightweightMMM**: JAX-based fast computation  
- **PyMC-Marketing**: Probabilistic programming with uncertainty quantification
- **Custom Ridge Regression**: Baseline model for limited data
- **Ensemble Models**: Intelligent combination for improved accuracy

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Chart.js/D3.js
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **AI/ML**: Multiple MMM frameworks + Celery for background processing
- **Infrastructure**: Docker + Redis + Multi-cloud deployment

## 📋 Development Phases

### Phase 1 (Weeks 1-2): Foundation ✅
- [x] Project structure and development environment
- [ ] FastAPI backend with authentication and database
- [ ] React frontend with component library
- [ ] PostgreSQL schema design
- [ ] Docker containerization

### Phase 2 (Weeks 3-6): Multi-Model Core
- [ ] MMM model implementations (Robyn, LightweightMMM, PyMC-Marketing)
- [ ] Model comparison and ensemble system
- [ ] Data integration (API connectors + file uploads)
- [ ] External factors system
- [ ] Data quality assessment framework

### Phase 3 Part 1 (Weeks 7-8): Advanced Analytics
- [ ] Advanced external factors analysis
- [ ] Scenario planning with optimization
- [ ] AI-powered recommendations engine
- [ ] Multi-model waterfall decomposition

### Phase 3 Part 2 (Weeks 9-10): Enterprise Features
- [ ] Co-Pilot mode advanced analytics
- [ ] Real-time API integrations
- [ ] Advanced export and reporting
- [ ] Production deployment architecture

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd smartsight-platform

# Start development environment
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Database: localhost:5432
```

## 📚 Documentation

- [Phase 1 Complete Guide](docs/phase1-complete.md)
- [Phase 2 Complete Guide](docs/phase2-complete.md)
- [Phase 3 Part 1 Guide](docs/phase3-part1-complete.md)
- [Phase 3 Part 2 Guide](docs/phase3-part2-complete.md)

## 🤝 Contributing

SmartSight is open-source and welcomes contributions from the community. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built by mahmoudkoura95 with the vision of democratizing marketing attribution for everyone.**
