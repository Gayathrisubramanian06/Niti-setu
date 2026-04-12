# Niti-Setu: Policy Research & Analysis Platform

Niti-Setu is a comprehensive web platform designed to bridge the gap between policy research and public understanding. It serves as a centralized repository for policy documents, research papers, and government initiatives, making complex information accessible to policymakers, researchers, and the general public.

## 🚀 Features

### For Researchers & Policymakers
- **Advanced Search**: Find specific policies or research using keywords, categories, or date ranges.
- **Document Repository**: Access a curated collection of policy documents and research papers.
- **Comparative Analysis**: Compare multiple policies side-by-side to identify trends and gaps.
- **Citation Management**: Generate citations for research papers and policy documents.

### For the Public
- **Simplified Summaries**: Read easy-to-understand summaries of complex government policies.
- **Interactive Dashboards**: Visualize policy impact and key metrics through interactive charts and graphs.
- **Feedback System**: Provide feedback directly on policies and research papers.
- **Notifications**: Stay updated with the latest policy releases and research findings.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **UI Components**: Custom components with Shadcn UI principles

### Backend
- **Framework**: Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Prisma
- **API**: RESTful API with Express.js

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Version Control**: Git & GitHub

## 📂 Project Structure

```
Niti-Setu/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── public/
│   └── package.json
├── backend/              # Node.js/Express application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── models/       # Prisma models
│   │   └── middleware/   # Custom middleware
│   ├── prisma/           # Database schema
│   ├── package.json
│   └── .env.example
├── docker-compose.yml    # Multi-container setup
├── Dockerfile            # Docker configurations
├── README.md             # Project documentation
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Niti-Setu
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Configure database connection in .env
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Start server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

### Using Docker

To run the application using Docker Compose:

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

## 📂 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nitisetu"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

### Frontend (`.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project Maintainers**: [Your Name/Team Name]
- **Email**: [Your Email Address]
- **Project Website**: [Link to Live Demo]

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) - For design system inspiration
- [React](https://react.dev/) - For the frontend framework
- [Express.js](https://expressjs.com/) - For the backend framework
- [PostgreSQL](https://www.postgresql.org/) - For the database

---

**Built with ❤️ for the policy research community**