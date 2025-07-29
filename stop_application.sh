#!/bin/bash

echo "🛑 Arrêt de l'application SMMC..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Arrêter le backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "📡 Arrêt du backend..."
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend arrêté${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend déjà arrêté${NC}"
    fi
    rm backend.pid
else
    echo -e "${YELLOW}⚠️  Aucun processus backend trouvé${NC}"
fi

# Arrêter le frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 Arrêt du frontend..."
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend arrêté${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend déjà arrêté${NC}"
    fi
    rm frontend.pid
else
    echo -e "${YELLOW}⚠️  Aucun processus frontend trouvé${NC}"
fi

# Nettoyer les processus Node.js et PHP
echo "🧹 Nettoyage des processus..."
pkill -f "php artisan serve" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo ""
echo -e "${GREEN}✅ Application SMMC arrêtée avec succès !${NC}" 