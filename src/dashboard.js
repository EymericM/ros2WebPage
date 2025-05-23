//////////////////////////////////////////////////////////////////////////////////
// RÉSEAU ROS, RENSEIGNEMENTS GLOBAUX
//////////////////////////////////////////////////////////////////////////////////
let ros = new ROSLIB.Ros({});
let nodes = [];
let nodeDetailsMap = new Map(); // node -> {publishing:Set,subscribing:Set,services:Set}
let topicsMap      = new Map(); // topic -> {type, publishers:Set, subscribers:Set}
let servicesMap    = new Map();
let connections    = [];
let graphChart     = null;

// Pour le message rate global
let tempMessageCount = 0;    // remis à zero chaque seconde pour calculer le rate
let totalMessageCount= 0;    // cumul global (jamais remis à zero)
let lastMsgTime      = Date.now(); 
let messageRate      = 0;

// DOM
const connectBtn       = document.getElementById('connect-btn');
const statusDot        = document.getElementById('status-dot');
const statusText       = document.getElementById('status-text');
const activeNodesCount = document.getElementById('active-nodes-count');
const connectionsCount = document.getElementById('connections-count');
const messageRateElem  = document.getElementById('message-rate');
const messageTotalElem = document.getElementById('message-total');
const nodeListElem     = document.getElementById('node-list');
const topicListElem    = document.getElementById('topic-list');
const serviceListElem  = document.getElementById('service-list');

const refreshGraphBtn  = document.getElementById('refresh-graph');
const layoutGraphBtn   = document.getElementById('layout-graph');

const tabButtons  = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

//////////////////////////////////////////////////////////////////////////////////
// ONGLET PARAM
//////////////////////////////////////////////////////////////////////////////////
const paramNodeSelect   = document.getElementById('param-node-select');
const listParamsBtn     = document.getElementById('list-params-btn');
const paramNameSelect   = document.getElementById('param-name-select');
const paramInfoDiv      = document.getElementById('param-info-div');
const paramTypeLabel    = document.getElementById('param-type-label');
const paramValueInput   = document.getElementById('param-value-input');
const paramValueBoolDiv = document.getElementById('param-value-bool-div');
const paramValueBoolChk = document.getElementById('param-value-bool');
const paramGetBtn       = document.getElementById('param-get-btn');
const paramSetBtn       = document.getElementById('param-set-btn');
const paramResult       = document.getElementById('param-result');

// Pour stocker les abonnements par topic
let topicSubscribers = new Map(); 
// Pour les stats par topic : { totalCount, tempCount, rate }
let topicStats = new Map();

//////////////////////////////////////////////////////////////////////////////////
// TABS
//////////////////////////////////////////////////////////////////////////////////
tabButtons.forEach(btn => {
  btn.addEventListener('click', ()=>{
    const tabId = btn.getAttribute('data-tab');
    tabButtons.forEach(b=>{
      b.classList.remove('border-indigo-500','text-indigo-600');
      b.classList.add('border-transparent','text-gray-500');
    });
    btn.classList.add('border-indigo-500','text-indigo-600');
    btn.classList.remove('border-transparent','text-gray-500');
    tabContents.forEach(c=>c.classList.remove('active'));
    document.getElementById(tabId+'-tab').classList.add('active');
  });
});

//////////////////////////////////////////////////////////////////////////////////
// CONNEXION ROS
//////////////////////////////////////////////////////////////////////////////////
connectBtn.addEventListener('click', ()=>{
  if (ros.isConnected) {
    ros.close();
  } else {
    connectToROS();
  }
});

ros.on('connection', ()=>{
  console.log("Connected to ROS");
  statusDot.classList.remove('status-inactive','status-unknown');
  statusDot.classList.add('status-active');
  statusText.textContent='Connecté';
  connectBtn.innerHTML='<i class="fas fa-plug mr-1"></i> Déconnecter';
  connectBtn.classList.remove('bg-indigo-600','hover:bg-indigo-700');
  connectBtn.classList.add('bg-red-600','hover:bg-red-700');

  fetchAllData();       // Récupération initiale
  setInterval(calcMsgRate,1000);  // Mise à jour du rate toutes les secondes
});

ros.on('error', (err)=>{
  console.error("ROS error:", err);
  statusDot.classList.remove('status-active','status-unknown');
  statusDot.classList.add('status-inactive');
  statusText.textContent='Erreur de connexion';
});

ros.on('close', ()=>{
  console.warn("Disconnected");
  statusDot.classList.remove('status-active','status-unknown');
  statusDot.classList.add('status-inactive');
  statusText.textContent='Déconnecté';
  connectBtn.innerHTML='<i class="fas fa-plug mr-1"></i> Connecter';
  connectBtn.classList.remove('bg-red-600','hover:bg-red-700');
  connectBtn.classList.add('bg-indigo-600','hover:bg-indigo-700');

  // reset
  nodes=[];
  nodeDetailsMap.clear();
  topicsMap.clear();
  servicesMap.clear();
  connections=[];
  // stop et vider les abonnements
  for(const [topic, sub] of topicSubscribers.entries()){
    try{ sub.unsubscribe(); }catch(e){}
  }
  topicSubscribers.clear();
  topicStats.clear();

  updateUI();
});

// ros : instance déjà créée de ROSLIB.Ros() ou équivalent
function connectToROS(port = 5010) {
  /* 1. Détermine le schéma (ws:// ou wss://) à partir du protocole HTTP/HTTPS
     2. Récupère le hostname de la page (ex. : my-robot.lab.fr)
     3. Assemble l’URL complète du WebSocket */
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host     = window.location.hostname;           
  const url      = `${protocol}//${host}:${port}`;     

  try {
    ros.connect(url);

    // feedback UI
    statusDot.classList.remove('status-inactive','status-active');
    statusDot.classList.add('status-unknown');
    statusText.textContent = 'Connexion en cours…';
  } catch (e) {
    console.error('connect error', e);

    statusDot.classList.remove('status-active', 'status-unknown');
    statusDot.classList.add('status-inactive');
    statusText.textContent = 'Erreur de connexion';
  }
}


//////////////////////////////////////////////////////////////////////////////////
// RÉCUPÉRATION DES DONNÉES GLOBALES
//////////////////////////////////////////////////////////////////////////////////
async function fetchAllData(){
  try {
    await getNodes();
    for(let n of nodes){
      await getNodeDetails(n);
    }
    await getTopics();
    await getServices();
    buildConnections();
    updateUI();

    // Après avoir récupéré les topics, on s'abonne pour compter les messages
    subscribeToAllTopics();
  } catch(e){
    console.error("fetchAllData error:", e);
  }
}

// /rosapi/nodes
function getNodes(){
  return new Promise((resolve, reject)=>{
    let service = new ROSLIB.Service({
      ros: ros,
      name:'/rosapi/nodes',
      serviceType:'rosapi/Nodes'
    });
    service.callService({}, (resp)=>{
      nodes=resp.nodes||[];
      resolve();
    }, (err)=>reject(err));
  });
}

// /rosapi/node_details
function getNodeDetails(nodeName){
  return new Promise((resolve)=>{
    let service = new ROSLIB.Service({
      ros: ros,
      name:'/rosapi/node_details',
      serviceType:'rosapi/NodeDetails'
    });
    let req = { node: nodeName };
    service.callService(req, (resp)=>{
      nodeDetailsMap.set(nodeName,{
        publishing:  new Set(resp.publishing  ||[]),
        subscribing: new Set(resp.subscribing ||[]),
        services:    new Set(resp.services    ||[])
      });
      resolve();
    }, (err)=>{
      console.warn("node_details fail:", nodeName, err);
      nodeDetailsMap.set(nodeName,{
        publishing:new Set(),subscribing:new Set(),services:new Set()
      });
      resolve();
    });
  });
}

// /rosapi/topics
function getTopics(){
  return new Promise((resolve, reject)=>{
    let service=new ROSLIB.Service({
      ros: ros,
      name:'/rosapi/topics',
      serviceType:'rosapi/Topics'
    });
    service.callService({}, (resp)=>{
      if(resp.topics && resp.types){
        for(let i=0;i<resp.topics.length;i++){
          topicsMap.set(resp.topics[i],{
            type:resp.types[i], 
            publishers:new Set(), 
            subscribers:new Set()
          });
        }
      }
      // Compléter par nodeDetails
      for(let [node,nd] of nodeDetailsMap.entries()){
        for(let t of nd.publishing){
          if(!topicsMap.has(t)){
            topicsMap.set(t,{type:'?',publishers:new Set(),subscribers:new Set()});
          }
          topicsMap.get(t).publishers.add(node);
        }
        for(let t of nd.subscribing){
          if(!topicsMap.has(t)){
            topicsMap.set(t,{type:'?',publishers:new Set(),subscribers:new Set()});
          }
          topicsMap.get(t).subscribers.add(node);
        }
      }
      resolve();
    }, (err)=>reject(err));
  });
}

// /rosapi/services + /rosapi/service_type
function getServices(){
  return new Promise((resolve, reject)=>{
    let service=new ROSLIB.Service({
      ros: ros,
      name:'/rosapi/services',
      serviceType:'rosapi/Services'
    });
    service.callService({}, async (resp)=>{
      let allSrv=resp.services||[];
      let promiseArr = allSrv.map(s=> getServiceType(s));
      await Promise.all(promiseArr);
      // identifier providers
      for(let [srvName, info] of servicesMap.entries()){
        for(let [node, nd] of nodeDetailsMap.entries()){
          if(nd.services.has(srvName)){
            info.providers.add(node);
          }
        }
      }
      resolve();
    }, (err)=>reject(err));
  });
}
function getServiceType(srvName){
  return new Promise((resolve)=>{
    let service = new ROSLIB.Service({
      ros: ros,
      name:'/rosapi/service_type',
      serviceType:'rosapi/ServiceType'
    });
    service.callService({service:srvName},(resp)=>{
      if(!servicesMap.has(srvName)){
        servicesMap.set(srvName,{type:resp.type, providers:new Set()});
      } else {
        servicesMap.get(srvName).type=resp.type;
      }
      resolve();
    },(err)=>{
      if(!servicesMap.has(srvName)){
        servicesMap.set(srvName,{type:'unknown',providers:new Set()});
      }
      resolve();
    });
  });
}

// Construire la liste de connexions
function buildConnections(){
  connections=[];
  let allNodes=Array.from(nodeDetailsMap.keys());
  for(let i=0;i<allNodes.length;i++){
    for(let j=i+1;j<allNodes.length;j++){
      let A=allNodes[i], B=allNodes[j];
      let nA=nodeDetailsMap.get(A), nB=nodeDetailsMap.get(B);
      if(!nA||!nB) continue;
      let shared1=[...nA.publishing].filter(t=>nB.subscribing.has(t));
      let shared2=[...nB.publishing].filter(t=>nA.subscribing.has(t));
      if(shared1.length>0||shared2.length>0){
        connections.push({source:A,target:B});
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
// ABONNEMENT AUX TOPICS & COMPTEUR DE MESSAGES
//////////////////////////////////////////////////////////////////////////////////
function subscribeToAllTopics(){
  // se désabonner d’abord (au cas où)
  for(const [topic, sub] of topicSubscribers.entries()){
    try{ sub.unsubscribe(); }catch(e){}
  }
  topicSubscribers.clear();
  topicStats.clear();

  for(let [topicName, info] of topicsMap.entries()){
    // Si on n’a pas de type défini (ou '?'), on ne s’abonne pas
    if(!info.type || info.type==='?' || info.type==='unknown') {
      continue;
    }
    // Initialiser les stats sur ce topic
    topicStats.set(topicName, {
      totalCount: 0,
      tempCount:  0,
      rate: 0
    });

    // Créer l’abonnement
    let sub = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: info.type
    });
    sub.subscribe((msg)=>{
      // Incrémenter les compteurs globaux
      tempMessageCount++;
      totalMessageCount++;

      // Incrémenter les compteurs du topic
      let st = topicStats.get(topicName);
      if(st){
        st.tempCount++;
        st.totalCount++;
      }
    });
    topicSubscribers.set(topicName, sub);
  }
}

//////////////////////////////////////////////////////////////////////////////////
// MISE À JOUR UI
//////////////////////////////////////////////////////////////////////////////////
function updateUI(){
  updateNodesList();
  updateTopicsList();
  updateServicesList();
  updateGraph();

  // remplir paramNodeSelect
  paramNodeSelect.innerHTML='<option value="">(choisir un nœud)</option>';
  nodes.forEach(n=>{
    let opt=document.createElement('option');
    opt.value=n; opt.textContent=n;
    paramNodeSelect.appendChild(opt);
  });

  activeNodesCount.textContent=nodes.length;
  connectionsCount.textContent=connections.length;
}

function updateNodesList(){
  nodeListElem.innerHTML='';
  if(nodes.length===0){
    nodeListElem.innerHTML='<li class="px-4 py-4 text-center text-gray-500">Aucun nœud détecté</li>';
    return;
  }
  for(let nodeName of nodes){
    let nd=nodeDetailsMap.get(nodeName);
    let pubCount= nd? nd.publishing.size:0;
    let subCount= nd? nd.subscribing.size:0;
    let srvCount= nd? nd.services.size:0;
    let li=document.createElement('li');
    li.className='px-4 py-3 hover:bg-gray-50 cursor-pointer';
    li.innerHTML=`
      <div class="flex items-center">
        <span class="status-indicator status-active"></span>
        <span class="text-sm font-medium text-gray-900">${nodeName}</span>
      </div>
      <div class="mt-1 text-xs text-gray-500">
        <span class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded">${pubCount+subCount} topics</span>
        <span class="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded ml-1">${srvCount} services</span>
      </div>
    `;
    nodeListElem.appendChild(li);
  }
}

function updateTopicsList(){
  topicListElem.innerHTML='';
  if(topicsMap.size===0){
    topicListElem.innerHTML='<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun topic détecté</td></tr>';
    return;
  }
  for(let [tn,info] of topicsMap.entries()){
    let pubCount=info.publishers.size;
    let subCount=info.subscribers.size;

    // Récupérer stats
    let st = topicStats.get(tn);
    let total = st ? st.totalCount : 0;
    let rate  = st ? st.rate.toFixed(1) : '0.0';

    let tr=document.createElement('tr');
    tr.className='hover:bg-gray-50';
    tr.innerHTML=`
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${tn}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${info.type}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded">${pubCount} pubs</span>
        <span class="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded ml-1">${subCount} subs</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${total}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${rate}</td>
    `;
    topicListElem.appendChild(tr);
  }
}

function updateServicesList(){
  serviceListElem.innerHTML='';
  if(servicesMap.size===0){
    serviceListElem.innerHTML='<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Aucun service détecté</td></tr>';
    return;
  }
  for(let [srvName,info] of servicesMap.entries()){
    let providers=Array.from(info.providers).join(', ')||'Inconnu';
    let tr=document.createElement('tr');
    tr.className='hover:bg-gray-50';
    tr.innerHTML=`
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${srvName}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${info.type}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${providers}</td>
    `;
    serviceListElem.appendChild(tr);
  }
}

//////////////////////////////////////////////////////////////////////////////////
// GESTION DU GRAPHE
//////////////////////////////////////////////////////////////////////////////////
function updateGraph(){
  if(!graphChart){
    graphChart = echarts.init(document.getElementById('graph-container'));
  }

  const nodeData = [];
  const linkData = [];

  // 1) nodes representing ROS nodes
  nodes.forEach(n => {
    nodeData.push({
      id: n,
      name: n,
      symbolSize: 40,
      category: 'node',
      label: {show: true},
      itemStyle: { color: '#6366f1' }
    });
  });

  // 2) nodes representing topics
  for(const [topic, info] of topicsMap.entries()){
    nodeData.push({
      id: topic,
      name: topic,
      symbolSize: 20,
      category: 'topic',
      label: {show: true},
      itemStyle: { color: '#f97316' }
    });
  }

  // 3) edges from node -> topic (publishing)
  for(const [nodeName, detail] of nodeDetailsMap.entries()){
    for(const t of detail.publishing){
      linkData.push({
        source: nodeName,
        target: t,
        lineStyle: { color: '#22c55e' },
        symbol: ['circle', 'arrow']
      });
    }
    // edges topic -> node (subscribing)
    for(const t of detail.subscribing){
      linkData.push({
        source: t,
        target: nodeName,
        lineStyle: { color: '#ef4444' },
        symbol: ['circle', 'arrow']
      });
    }
  }

  const opt = {
    tooltip:{},
    legend: [{
      data: ['node','topic'],
      bottom: 0
    }],
    series:[{
      type:'graph',
      layout:'force',
      data:nodeData,
      links:linkData,
      categories:[{name:'node'},{name:'topic'}],
      roam:true,
      draggable:true,
      label:{position:'right'},
      force:{repulsion:100, edgeLength:100},
      emphasis:{
        focus:'adjacency',
        lineStyle:{width:3}
      }
    }]
  };

  graphChart.setOption(opt);

  setTimeout(() => {
    graphChart.dispatchAction({type:'force', iterations:100});
  }, 300);
}

layoutGraphBtn.addEventListener('click',()=>{
  if(graphChart){
    let opt = graphChart.getOption();
    opt.series[0].layout = 'none';
    opt.series[0].force = null;    
    opt.series[0].draggable = true;
    graphChart.setOption(opt);
  }
});

refreshGraphBtn.addEventListener('click',()=>{
  updateGraph();
});

//////////////////////////////////////////////////////////////////////////////////
// MESSAGE RATE (CALCUL TOUTES LES SECONDES)
//////////////////////////////////////////////////////////////////////////////////
function calcMsgRate(){
  let now = Date.now();
  let dt  = (now - lastMsgTime)/1000; // en s
  if(dt>0){
    messageRate = tempMessageCount/dt;
    // On vide le compteur temporaire
    tempMessageCount=0;
    lastMsgTime=now;

    // Calcul rate pour chaque topic
    for(let [tn, st] of topicStats.entries()){
      st.rate = st.tempCount / dt;
      st.tempCount = 0;
    }

    // Mise à jour UI
    messageRateElem.textContent = messageRate.toFixed(1);
    messageTotalElem.textContent= totalMessageCount;
    updateTopicsList();
  }
}

//////////////////////////////////////////////////////////////////////////////////
// ONGLET PARAM : list_parameters -> describe_parameters -> get/set
//////////////////////////////////////////////////////////////////////////////////
listParamsBtn.addEventListener('click', ()=>{
  let nodeSel = paramNodeSelect.value;
  if(!nodeSel){
    alert("Sélectionnez d’abord un nœud");
    return;
  }
  let serviceName = `${nodeSel}/list_parameters`;
  let service = new ROSLIB.Service({
    ros: ros,
    name: serviceName,
    serviceType: 'rcl_interfaces/srv/ListParameters'
  });
  let request = new ROSLIB.ServiceRequest({});
  service.callService(request, (resp)=>{
    if(!resp.result || !resp.result.names){
      paramNameSelect.innerHTML='<option value="">(aucun param ?)</option>';
      alert("Aucun paramètre trouvé (ou node sans param)");
      return;
    }
    let names=resp.result.names;
    paramNameSelect.innerHTML='';
    if(names.length===0){
      paramNameSelect.innerHTML='<option value="">(aucun param)</option>';
      alert("Aucun paramètre sur ce nœud");
      return;
    }
    names.forEach(param=>{
      let opt=document.createElement('option');
      opt.value=param; opt.textContent=param;
      paramNameSelect.appendChild(opt);
    });
    paramInfoDiv.style.display='none';
  }, (err)=>{
    alert("list_parameters échoué : "+err);
  });
});

// describe_parameters
paramNameSelect.addEventListener('change', ()=>{
  let nodeSel = paramNodeSelect.value;
  let paramSel= paramNameSelect.value;
  if(!nodeSel || !paramSel) {
    paramInfoDiv.style.display='none';
    return;
  }
  let srvName=`${nodeSel}/describe_parameters`;
  let describeSvc=new ROSLIB.Service({
    ros:ros,
    name: srvName,
    serviceType:'rcl_interfaces/srv/DescribeParameters'
  });
  let req = new ROSLIB.ServiceRequest({ names: [paramSel] });
  describeSvc.callService(req, (resp)=>{
    if(!resp.descriptors || resp.descriptors.length===0){
      paramInfoDiv.style.display='none';
      alert("Paramètre introuvable ou pas de descriptor");
      return;
    }
    paramInfoDiv.style.display='block';
    let desc=resp.descriptors[0];
    let t=desc.type; // 1=bool,2=int,3=double,4=string
    let typeStr = paramTypeToString(t);
    paramTypeLabel.textContent = typeStr;

    paramValueInput.style.display='none';
    paramValueBoolDiv.style.display='none';

    switch(t){
      case 1: // bool
        paramValueBoolDiv.style.display='block';
        paramValueBoolChk.checked=false;
        break;
      case 2: // int
      case 3: // double
      case 4: // string
        paramValueInput.style.display='block';
        paramValueInput.value='';
        paramValueInput.placeholder=`Tapez une valeur ${typeStr}`;
        break;
      default:
        break;
    }
  },(err)=>{
    alert("describe_parameters fail : "+err);
  });
});

// get_parameters
paramGetBtn.addEventListener('click', ()=>{
  let nodeSel=paramNodeSelect.value;
  let paramSel=paramNameSelect.value;
  if(!nodeSel||!paramSel){
    alert("Choisir un nœud et un paramètre d’abord");
    return;
  }
  let srvName=`${nodeSel}/get_parameters`;
  let getSvc=new ROSLIB.Service({
    ros:ros,
    name:srvName,
    serviceType:'rcl_interfaces/srv/GetParameters'
  });
  let req=new ROSLIB.ServiceRequest({ names:[paramSel] });
  getSvc.callService(req,(resp)=>{
    if(!resp.values || resp.values.length===0){
      paramResult.innerHTML='<em>Param non configuré ?</em>';
      return;
    }
    let val=resp.values[0];
    let strVal='';
    switch(val.type){
      case 1: strVal = val.bool_value? 'true':'false'; break;
      case 2: strVal = val.integer_value.toString(); break;
      case 3: strVal = val.double_value.toString(); break;
      case 4: strVal = val.string_value; break;
      default: strVal='(pas défini ou type inconnu)';
    }
    paramResult.innerHTML=`<p class="text-sm">Valeur actuelle de <strong>${paramSel}</strong>: <code>${strVal}</code></p>`;
  }, (err)=>{
    paramResult.innerHTML=`<p class="text-red-600">Echec get_parameters: ${err}</p>`;
  });
});

// set_parameters
paramSetBtn.addEventListener('click', ()=>{
  let nodeSel=paramNodeSelect.value;
  let paramSel=paramNameSelect.value;
  if(!nodeSel||!paramSel){
    alert("Choisir un nœud et un paramètre d’abord");
    return;
  }
  let tLabel=paramTypeLabel.textContent;
  let paramVal;
  if(tLabel.includes('bool')){
    paramVal = paramValueBoolChk.checked;
  } else if(tLabel.includes('int')){
    let s=paramValueInput.value.trim();
    paramVal=parseInt(s,10);
    if(isNaN(paramVal)){ alert("Entier invalide"); return; }
  } else if(tLabel.includes('double')){
    let s=paramValueInput.value.trim();
    paramVal=parseFloat(s);
    if(isNaN(paramVal)){ alert("Double invalide"); return; }
  } else if(tLabel.includes('string')){
    paramVal=paramValueInput.value;
  } else {
    alert("Type inconnu, impossible de set");
    return;
  }
  let paramType = guessParamType(tLabel);

  let srvName=`${nodeSel}/set_parameters`;
  let setSvc=new ROSLIB.Service({
    ros:ros,
    name:srvName,
    serviceType:'rcl_interfaces/srv/SetParameters'
  });
  let req=new ROSLIB.ServiceRequest({
    parameters:[
      {
        name:paramSel,
        value:{
          type:paramType,
          bool_value:   (paramType===1)? paramVal:false,
          integer_value:(paramType===2)? paramVal:0,
          double_value: (paramType===3)? paramVal:0.0,
          string_value: (paramType===4)? paramVal:''
        }
      }
    ]
  });
  setSvc.callService(req,(resp)=>{
    if(!resp.results || resp.results.length===0){
      paramResult.innerHTML='<em>Pas de résultat ?</em>';
      return;
    }
    let r=resp.results[0];
    if(r.successful){
      paramResult.innerHTML=`<p class="text-green-600">SET OK: ${r.reason}</p>`;
    } else {
      paramResult.innerHTML=`<p class="text-red-600">Echec: ${r.reason}</p>`;
    }
  },(err)=>{
    paramResult.innerHTML=`<p class="text-red-600">Echec set_parameters: ${err}</p>`;
  });
});

//////////////////////////////////////////////////////////////////////////////////
// Fonctions utilitaires
//////////////////////////////////////////////////////////////////////////////////
function paramTypeToString(num){
  switch(num){
    case 1: return "bool";
    case 2: return "integer";
    case 3: return "double";
    case 4: return "string";
    case 5: return "byte_array";
    default: return "(param_not_set)";
  }
}
function guessParamType(label){
  if(label.includes('bool'))    return 1;
  if(label.includes('int'))     return 2;
  if(label.includes('double'))  return 3;
  if(label.includes('string'))  return 4;
  return 0; // PARAMETER_NOT_SET
}

//////////////////////////////////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////////////////////////////////
function init(){
  updateGraph();   // graph vide en attendant la connexion
  connectToROS();
}

export { init };
