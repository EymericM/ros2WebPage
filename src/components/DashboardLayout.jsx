import React from 'react';

export default function DashboardLayout() {
return (
  <div className="container mx-auto px-4 py-8">
    
      {/* HEADER  */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-robot mr-2 text-indigo-600"></i> Hermes Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div id="connection-status" className="flex items-center">
              <span className="status-indicator status-inactive" id="status-dot"></span>
              <span id="status-text" className="text-sm font-medium">Déconnecté</span>
            </div>
            <button id="connect-btn" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <i className="fas fa-plug mr-1"></i> Connecter
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Surveillance et gestion du coeur Hermes en temps réel</p>
      </header>
    
      {/* TABS NAV  */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="tab-button py-4 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600" data-tab="nodes">
            <i className="fas fa-project-diagram mr-1"></i> Nœuds
          </button>
          <button className="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="topics">
            <i className="fas fa-exchange-alt mr-1"></i> Topics
          </button>
          <button className="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="services">
            <i className="fas fa-concierge-bell mr-1"></i> Services
          </button>
          {/* NOUVEL ONGLET "param"  */}
          <button className="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="param">
            <i className="fas fa-cog mr-1"></i> Paramètres
          </button>
        </nav>
      </div>
    
      {/* TAB CONTENTS  */}
    
      {/* 1) NODES TAB  */}
      <div className="tab-content active" id="nodes-tab">
        {/* Stats, node list, graph...  */}
        {/* On passe la grid de 3 à 4 colonnes pour ajouter le total de messages  */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <i className="fas fa-project-diagram text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Nœuds actifs</h3>
                <p className="text-2xl font-semibold text-gray-900" id="active-nodes-count">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <i className="fas fa-link text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Connexions</h3>
                <p className="text-2xl font-semibold text-gray-900" id="connections-count">0</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <i className="fas fa-tachometer-alt text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Messages/s</h3>
                <p className="text-2xl font-semibold text-gray-900" id="message-rate">0</p>
              </div>
            </div>
          </div>
          {/* Ajout: Nombre total de messages reçus  */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                <i className="fas fa-comment-dots text-xl"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-gray-500 text-sm font-medium">Total Messages</h3>
                <p className="text-2xl font-semibold text-gray-900" id="message-total">0</p>
              </div>
            </div>
          </div>
        </div>
    
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node List  */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  <i className="fas fa-list mr-1"></i> Liste des nœuds
                </h3>
              </div>
              <div className="bg-white overflow-y-auto" style={{maxHeight: 1px}}>
                <ul className="divide-y divide-gray-200" id="node-list">
                  <li className="px-4 py-4 text-center text-gray-500">Aucun nœud détecté</li>
                </ul>
              </div>
            </div>
          </div>
    
          {/* Graph Visualization  */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  <i className="fas fa-network-wired mr-1"></i> Visualisation du graphe
                </h3>
                <div className="flex space-x-2">
                  <button id="refresh-graph" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                    <i className="fas fa-sync-alt mr-1"></i> Rafraîchir
                  </button>
                  <button id="layout-graph" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                    <i className="fas fa-project-diagram mr-1"></i> Réorganiser
                  </button>
                </div>
              </div>
              <div id="graph-container"></div>
            </div>
          </div>
        </div>
      </div>
    
      {/* 2) TOPICS TAB  */}
      <div className="tab-content" id="topics-tab">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              <i className="fas fa-exchange-alt mr-1"></i> Liste des Topics
            </h3>
          </div>
          <div className="bg-white overflow-y-auto" style={{maxHeight: 1px}}>
            {/* On ajoute deux colonnes : Total et Msg/s  */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pub/Sub</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Msg/s</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" id="topic-list">
                <tr><td colspan="5" className="px-6 py-4 text-center text-gray-500">Aucun topic détecté</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      {/* 3) SERVICES TAB  */}
      <div className="tab-content" id="services-tab">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              <i className="fas fa-concierge-bell mr-1"></i> Liste des Services
            </h3>
          </div>
          <div className="bg-white overflow-y-auto" style={{maxHeight: 1px}}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nœud</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200" id="service-list">
                <tr><td colspan="3" className="px-6 py-4 text-center text-gray-500">Aucun service détecté</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      {/* 4) PARAM TAB  */}
      <div className="tab-content" id="param-tab">
        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            <i className="fas fa-cog mr-1"></i> Gérer les Paramètres
          </h3>
    
          {/* Sélection du nœud  */}
          <div className="mb-4">
            <label for="param-node-select" className="block text-sm font-medium text-gray-700">Nœud</label>
            <select id="param-node-select" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Sélectionner un nœud</option>
            </select>
          </div>
    
          {/* Bouton list_parameters  */}
          <div className="mb-4">
            <button id="list-params-btn" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <i className="fas fa-list mr-1"></i> list_parameters
            </button>
          </div>
    
          {/* Sélection du paramètre  */}
          <div className="mb-4">
            <label for="param-name-select" className="block text-sm font-medium text-gray-700">Paramètre</label>
            <select id="param-name-select" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Aucun param pour l’instant</option>
            </select>
          </div>
    
          {/* Section "type détecté" + champ de saisie  */}
          <div className="mb-4" id="param-info-div" style={{display: 'none'}}>
            <p className="text-sm text-gray-600 mb-1">Type détecté : <span id="param-type-label" className="font-semibold"> inconnu </span></p>
            {/* On peut afficher un input/checkbox en fonction du type  */}
            <input type="text" id="param-value-input" className="mt-1 mb-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Entrez la valeur" style={{display: 'none'}}>
            <div id="param-value-bool-div" className="mb-2" style={{display: 'none'}}>
              <label className="inline-flex items-center text-sm">
                <input type="checkbox" id="param-value-bool" className="form-checkbox h-4 w-4 text-indigo-600">
                <span className="ml-2">Valeur booléenne</span>
              </label>
            </div>
          </div>
    
          {/* Boutons GET / SET  */}
          <div className="flex space-x-2">
            <button id="param-get-btn" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <i className="fas fa-download mr-1"></i> GET
            </button>
            <button id="param-set-btn" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              <i className="fas fa-upload mr-1"></i> SET
            </button>
          </div>
    
          {/* Zone d’affichage de la valeur ou des erreurs  */}
          <div id="param-result" className="mt-3 text-sm text-gray-700 bg-white p-3 border border-gray-200 rounded">
            <em>Aucune action</em>
          </div>
        </div>
      </div>
    </div>
  );
}
