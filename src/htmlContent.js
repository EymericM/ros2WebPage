export default `
<div class="container mx-auto px-4 py-8">

  <!-- HEADER -->
  <header class="mb-8">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">
        <i class="fas fa-robot mr-2 text-indigo-600"></i> Hermes Dashboard
      </h1>
      <div class="flex items-center space-x-4">
        <div id="connection-status" class="flex items-center">
          <span class="status-indicator status-inactive" id="status-dot"></span>
          <span id="status-text" class="text-sm font-medium">Déconnecté</span>
        </div>
        <button id="connect-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-plug mr-1"></i> Connecter
        </button>
      </div>
    </div>
    <p class="text-gray-600 mt-2">Surveillance et gestion du coeur Hermes en temps réel</p>
  </header>

  <!-- TABS NAV -->
  <div class="mb-6 border-b border-gray-200">
    <nav class="-mb-px flex space-x-8">
      <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600" data-tab="nodes">
        <i class="fas fa-project-diagram mr-1"></i> Nœuds
      </button>
      <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="topics">
        <i class="fas fa-exchange-alt mr-1"></i> Topics
      </button>
      <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="services">
        <i class="fas fa-concierge-bell mr-1"></i> Services
      </button>
      <!-- NOUVEL ONGLET "param" -->
      <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" data-tab="param">
        <i class="fas fa-cog mr-1"></i> Paramètres
      </button>
    </nav>
  </div>

  <!-- TAB CONTENTS -->

  <!-- 1) NODES TAB -->
  <div class="tab-content active" id="nodes-tab">
    <!-- Stats, node list, graph... -->
    <!-- On passe la grid de 3 à 4 colonnes pour ajouter le total de messages -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-indigo-50 text-indigo-600">
            <i class="fas fa-project-diagram text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Nœuds actifs</h3>
            <p class="text-2xl font-semibold text-gray-900" id="active-nodes-count">0</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-50 text-green-600">
            <i class="fas fa-link text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Connexions</h3>
            <p class="text-2xl font-semibold text-gray-900" id="connections-count">0</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-50 text-blue-600">
            <i class="fas fa-tachometer-alt text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Messages/s</h3>
            <p class="text-2xl font-semibold text-gray-900" id="message-rate">0</p>
          </div>
        </div>
      </div>
      <!-- Ajout: Nombre total de messages reçus -->
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-50 text-yellow-600">
            <i class="fas fa-comment-dots text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-gray-500 text-sm font-medium">Total Messages</h3>
            <p class="text-2xl font-semibold text-gray-900" id="message-total">0</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Node List -->
      <div class="lg:col-span-1">
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              <i class="fas fa-list mr-1"></i> Liste des nœuds
            </h3>
          </div>
          <div class="bg-white overflow-y-auto" style="max-height: 500px;">
            <ul class="divide-y divide-gray-200" id="node-list">
              <li class="px-4 py-4 text-center text-gray-500">Aucun nœud détecté</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Graph Visualization -->
      <div class="lg:col-span-3">
        <div class="bg-white shadow rounded-lg p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              <i class="fas fa-network-wired mr-1"></i> Visualisation du graphe
            </h3>
            <div class="flex space-x-2">
              <button id="refresh-graph" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-sync-alt mr-1"></i> Rafraîchir
              </button>
              <button id="layout-graph" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-project-diagram mr-1"></i> Réorganiser
              </button>
            </div>
          </div>
          <div id="graph-container"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2) TOPICS TAB -->
  <div class="tab-content" id="topics-tab">
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          <i class="fas fa-exchange-alt mr-1"></i> Liste des Topics
        </h3>
      </div>
      <div class="bg-white overflow-y-auto" style="max-height: 600px;">
        <!-- On ajoute deux colonnes : Total et Msg/s -->
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pub/Sub</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Msg/s</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="topic-list">
            <tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun topic détecté</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 3) SERVICES TAB -->
  <div class="tab-content" id="services-tab">
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          <i class="fas fa-concierge-bell mr-1"></i> Liste des Services
        </h3>
      </div>
      <div class="bg-white overflow-y-auto" style="max-height: 600px;">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nœud</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" id="service-list">
            <tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Aucun service détecté</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 4) PARAM TAB -->
  <div class="tab-content" id="param-tab">
    <div class="bg-white shadow rounded-lg overflow-hidden p-6">
      <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
        <i class="fas fa-cog mr-1"></i> Gérer les Paramètres
      </h3>

      <!-- Sélection du nœud -->
      <div class="mb-4">
        <label for="param-node-select" class="block text-sm font-medium text-gray-700">Nœud</label>
        <select id="param-node-select" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Sélectionner un nœud</option>
        </select>
      </div>

      <!-- Bouton list_parameters -->
      <div class="mb-4">
        <button id="list-params-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-list mr-1"></i> list_parameters
        </button>
      </div>

      <!-- Sélection du paramètre -->
      <div class="mb-4">
        <label for="param-name-select" class="block text-sm font-medium text-gray-700">Paramètre</label>
        <select id="param-name-select" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Aucun param pour l’instant</option>
        </select>
      </div>

      <!-- Section "type détecté" + champ de saisie -->
      <div class="mb-4" id="param-info-div" style="display: none;">
        <p class="text-sm text-gray-600 mb-1">Type détecté : <span id="param-type-label" class="font-semibold"> inconnu </span></p>
        <!-- On peut afficher un input/checkbox en fonction du type -->
        <input type="text" id="param-value-input" class="mt-1 mb-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Entrez la valeur" style="display: none;">
        <div id="param-value-bool-div" class="mb-2" style="display: none;">
          <label class="inline-flex items-center text-sm">
            <input type="checkbox" id="param-value-bool" class="form-checkbox h-4 w-4 text-indigo-600">
            <span class="ml-2">Valeur booléenne</span>
          </label>
        </div>
      </div>

      <!-- Boutons GET / SET -->
      <div class="flex space-x-2">
        <button id="param-get-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-download mr-1"></i> GET
        </button>
        <button id="param-set-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <i class="fas fa-upload mr-1"></i> SET
        </button>
      </div>

      <!-- Zone d’affichage de la valeur ou des erreurs -->
      <div id="param-result" class="mt-3 text-sm text-gray-700 bg-white p-3 border border-gray-200 rounded">
        <em>Aucune action</em>
      </div>
    </div>
  </div>
</div>

`;
