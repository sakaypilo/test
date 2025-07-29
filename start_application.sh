#!/bin/bash

echo "🚀 Démarrage de l'application SMMC..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que les ports sont libres
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Le port $1 est déjà utilisé${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 libre${NC}"
        return 0
    fi
}

# Démarrer le backend
start_backend() {
    echo "📡 Démarrage du backend Laravel..."
    cd backend
    
    # Vérifier les dépendances
    if [ ! -f "vendor/autoload.php" ]; then
        echo "📦 Installation des dépendances PHP..."
        composer install --no-dev --optimize-autoloader
    fi
    
    # Vérifier la base de données
    echo "🗄️  Vérification de la base de données..."
    php artisan migrate:status > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "🔄 Migration de la base de données..."
        php artisan migrate:fresh --seed
    fi
    
    # Démarrer le serveur
    echo "🚀 Démarrage du serveur backend sur http://localhost:8000"
    php artisan serve --host=0.0.0.0 --port=8000 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    
    cd ..
}

# Démarrer le frontend
start_frontend() {
    echo "🎨 Démarrage du frontend React..."
    cd frontend
    
    # Vérifier les dépendances
    if [ ! -d "node_modules" ]; then
        echo "📦 Installation des dépendances Node.js..."
        npm install
    fi
    
    # Démarrer le serveur de développement
    echo "🚀 Démarrage du serveur frontend sur http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    cd ..
}

# Fonction principale
main() {
    echo "🔍 Vérification des ports..."
    check_port 8000
    check_port 5173
    
    echo ""
    echo "🏗️  Démarrage des services..."
    
    # Démarrer le backend
    start_backend
    
    # Attendre que le backend soit prêt
    echo "⏳ Attente du démarrage du backend..."
    sleep 5
    
    # Tester le backend
    if curl -s http://localhost:8000/api/test > /dev/null; then
        echo -e "${GREEN}✅ Backend opérationnel${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend en cours de démarrage...${NC}"
    fi
    
    # Démarrer le frontend
    start_frontend
    
    # Attendre que le frontend soit prêt
    echo "⏳ Attente du démarrage du frontend..."
    sleep 10
    
    # Tester le frontend
    if curl -s -I http://localhost:5173 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Frontend opérationnel${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend en cours de démarrage...${NC}"
    fi
    
    echo ""
    echo "🎉 Application SMMC démarrée avec succès !"
    echo ""
    echo "📱 URLs d'accès :"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:8000/api"
    echo ""
    echo "🔑 Identifiants de test :"
    echo "   Matricule: 2018025"
    echo "   Mot de passe: password"
    echo ""
    echo "🛑 Pour arrêter l'application : ./stop_application.sh"
    echo ""
}

# Gestion des signaux
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    
    if [ -f "backend.pid" ]; then
        kill $(cat backend.pid) 2>/dev/null
        rm backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        kill $(cat frontend.pid) 2>/dev/null
        rm frontend.pid
    fi
    
    echo "✅ Application arrêtée"
    exit 0
}

# Capturer les signaux
trap cleanup SIGINT SIGTERM

# Lancer l'application
main

# Garder le script en vie
echo "🔄 Application en cours d'exécution... (Ctrl+C pour arrêter)"
while true; do
    sleep 1
done 