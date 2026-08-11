#!/bin/bash

# ShoaibSH Repository Setup Script
# This script creates the complete project structure and installs dependencies

set -e

echo "🚀 ShoaibSH Setup Starting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directory structure
echo -e "${BLUE}📁 Creating project directories...${NC}"
mkdir -p app/api/{auth,shorts,users,comments}
mkdir -p app/\(auth\)/{login,signup,forgot-password}
mkdir -p app/\(main\)/{explore,shorts,profile,search,dashboard}
mkdir -p components
mkdir -p lib
mkdir -p models
mkdir -p middleware
mkdir -p .github/workflows
mkdir -p public/{images,icons}
mkdir -p tests/{api,components}
mkdir -p types

echo -e "${GREEN}✅ Directories created!${NC}"
echo ""

# Create placeholder files to maintain directory structure
echo -e "${BLUE}📝 Creating placeholder files...${NC}"
touch components/.gitkeep
touch public/images/.gitkeep
touch public/icons/.gitkeep
touch tests/api/.gitkeep
touch tests/components/.gitkeep

echo -e "${GREEN}✅ Placeholder files created!${NC}"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "${BLUE}🔐 Creating .env.local...${NC}"
  cat > .env.local << 'EOF'
# Database
MONGODB_URI=mongodb://localhost:27017/shoaibsh

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000

# Video Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Environment
NODE_ENV=development
EOF
  echo -e "${GREEN}✅ .env.local created!${NC}"
else
  echo -e "${YELLOW}ℹ️  .env.local already exists. Skipping...${NC}"
fi
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
echo "This may take a few minutes..."
echo ""

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo ""
echo -e "${GREEN}✅ Dependencies installed!${NC}"
echo ""

# Success message
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✨ Setup Complete! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. 🔐 Update .env.local with your configuration:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: A secure random string"
echo "   - CLOUDINARY_*: Your Cloudinary API credentials"
echo ""
echo "2. 🚀 Start development server:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "3. 🌐 Open your browser:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "4. 📚 Check the README for more information:"
echo "   ${BLUE}cat README.md${NC}"
echo ""

echo -e "${YELLOW}💡 Useful Commands:${NC}"
echo "   npm run build     - Build for production"
echo "   npm run start     - Start production server"
echo "   npm run lint      - Run linter"
echo "   npm test          - Run tests"
echo ""

echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
