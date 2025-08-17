<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class WebAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Vérifier si l'utilisateur est connecté
        if (!Session::has('user')) {
            return redirect()->route('login')->with('error', 'Vous devez vous connecter pour accéder à cette page');
        }
        
        $user = Session::get('user');
        
        // Vérifier que l'utilisateur a les droits d'accès
        if (!in_array($user['role'], ['admin', 'responsable'])) {
            Session::forget('user');
            return redirect()->route('login')->with('error', 'Vous n\'avez pas les droits d\'accès à cette interface');
        }
        
        return $next($request);
    }
}
