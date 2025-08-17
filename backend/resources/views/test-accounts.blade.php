<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Comptes de Test - SMMC</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem 0;
        }
        
        .test-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .test-header {
            background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .account-card {
            border: 2px solid #e9ecef;
            border-radius: 15px;
            transition: all 0.3s ease;
            margin-bottom: 1rem;
        }
        
        .account-card:hover {
            border-color: #4e73df;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(78, 115, 223, 0.2);
        }
        
        .role-badge {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
        }
        
        .btn-test {
            background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
            border: none;
            border-radius: 10px;
            padding: 0.5rem 1.5rem;
            color: white;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-test:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 115, 223, 0.3);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="test-container">
            <div class="test-header">
                <i class="fas fa-users fa-3x mb-3"></i>
                <h1>Comptes de Test SMMC</h1>
                <p class="mb-0">Interface Web d'Administration</p>
            </div>
            
            <div class="p-4">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Information :</strong> Seuls les comptes Admin et Responsable peuvent accéder à l'interface web d'administration.
                </div>
                
                <div class="row">
                    <!-- Compte Admin -->
                    <div class="col-md-6 mb-4">
                        <div class="account-card p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="mb-1">
                                        <i class="fas fa-crown text-warning me-2"></i>
                                        Administrateur
                                    </h5>
                                    <span class="role-badge bg-danger text-white">ADMIN</span>
                                </div>
                                <i class="fas fa-user-shield fa-2x text-muted"></i>
                            </div>
                            
                            <div class="mb-3">
                                <div class="row">
                                    <div class="col-sm-4"><strong>Nom :</strong></div>
                                    <div class="col-sm-8">ADMIN Système</div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Matricule :</strong></div>
                                    <div class="col-sm-8"><code>2018001</code></div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Mot de passe :</strong></div>
                                    <div class="col-sm-8"><code>admin123</code></div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Email :</strong></div>
                                    <div class="col-sm-8">admin@smmc.mg</div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6 class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>Permissions :
                                </h6>
                                <ul class="list-unstyled mb-0 small">
                                    <li><i class="fas fa-check text-success me-2"></i>Accès complet à l'administration</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Gestion de la corbeille</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Suppression de tous les éléments</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Restauration des éléments</li>
                                </ul>
                            </div>
                            
                            <form method="POST" action="{{ route('login.post') }}">
                                @csrf
                                <input type="hidden" name="matricule" value="2018001">
                                <input type="hidden" name="password" value="admin123">
                                <button type="submit" class="btn btn-test w-100">
                                    <i class="fas fa-sign-in-alt me-2"></i>
                                    Se connecter en tant qu'Admin
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Compte Responsable -->
                    <div class="col-md-6 mb-4">
                        <div class="account-card p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 class="mb-1">
                                        <i class="fas fa-user-tie text-primary me-2"></i>
                                        Responsable
                                    </h5>
                                    <span class="role-badge bg-warning text-dark">RESPONSABLE</span>
                                </div>
                                <i class="fas fa-user-cog fa-2x text-muted"></i>
                            </div>
                            
                            <div class="mb-3">
                                <div class="row">
                                    <div class="col-sm-4"><strong>Nom :</strong></div>
                                    <div class="col-sm-8">RAKOTO Jean</div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Matricule :</strong></div>
                                    <div class="col-sm-8"><code>2018025</code></div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Mot de passe :</strong></div>
                                    <div class="col-sm-8"><code>password</code></div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-4"><strong>Email :</strong></div>
                                    <div class="col-sm-8">jean.rakoto@smmc.mg</div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h6 class="text-success">
                                    <i class="fas fa-check-circle me-1"></i>Permissions :
                                </h6>
                                <ul class="list-unstyled mb-0 small">
                                    <li><i class="fas fa-check text-success me-2"></i>Accès à l'administration</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Gestion de la corbeille</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Suppression de tous les éléments</li>
                                    <li><i class="fas fa-check text-success me-2"></i>Restauration des éléments</li>
                                </ul>
                            </div>
                            
                            <form method="POST" action="{{ route('login.post') }}">
                                @csrf
                                <input type="hidden" name="matricule" value="2018025">
                                <input type="hidden" name="password" value="password">
                                <button type="submit" class="btn btn-test w-100">
                                    <i class="fas fa-sign-in-alt me-2"></i>
                                    Se connecter en tant que Responsable
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <!-- Comptes sans accès -->
                <div class="mt-4">
                    <h5 class="text-muted">
                        <i class="fas fa-ban me-2"></i>Comptes sans accès à l'interface web
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card border-secondary">
                                <div class="card-body">
                                    <h6 class="card-title">
                                        <i class="fas fa-user-shield text-info me-2"></i>Agent de Sécurité
                                    </h6>
                                    <p class="card-text small">
                                        <strong>Matricule :</strong> 2020012<br>
                                        <strong>Mot de passe :</strong> password<br>
                                        <span class="text-danger">
                                            <i class="fas fa-times me-1"></i>Pas d'accès web (mobile uniquement)
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card border-secondary">
                                <div class="card-body">
                                    <h6 class="card-title">
                                        <i class="fas fa-tools text-success me-2"></i>Technicien
                                    </h6>
                                    <p class="card-text small">
                                        <strong>Matricule :</strong> 2019008<br>
                                        <strong>Mot de passe :</strong> password<br>
                                        <span class="text-danger">
                                            <i class="fas fa-times me-1"></i>Pas d'accès web (mobile uniquement)
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Instructions -->
                <div class="mt-4">
                    <div class="alert alert-light border">
                        <h6 class="alert-heading">
                            <i class="fas fa-lightbulb text-warning me-2"></i>Instructions de Test
                        </h6>
                        <ol class="mb-0">
                            <li>Cliquez sur un des boutons de connexion ci-dessus</li>
                            <li>Vous serez automatiquement connecté et redirigé vers le dashboard</li>
                            <li>Explorez les fonctionnalités selon les permissions du rôle</li>
                            <li>Testez la corbeille et les suppressions</li>
                            <li>Utilisez le bouton de déconnexion dans la sidebar</li>
                        </ol>
                    </div>
                </div>
                
                <!-- Liens utiles -->
                <div class="text-center mt-4">
                    <a href="{{ route('login') }}" class="btn btn-outline-primary me-2">
                        <i class="fas fa-sign-in-alt me-1"></i>Page de Connexion
                    </a>
                    <a href="/test-models" class="btn btn-outline-info me-2">
                        <i class="fas fa-database me-1"></i>Test Modèles
                    </a>
                    <a href="/test-trash" class="btn btn-outline-warning">
                        <i class="fas fa-vial me-1"></i>Test Corbeille
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
