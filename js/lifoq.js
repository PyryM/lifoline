var engine;
var gui;
var params;
var TIMESTEP = 1000.0 / 60.0;
var agents = [];
var agentWorld = {};
var q;
var stime = 0;
var nextSpawnTime = 0;

function init() {
  // Matter.js module aliases
  var Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies;

  // create a Matter.js engine
  engine = Engine.create(document.body);
  engine.world.gravity.y = 0;

  agentWorld.engine = engine;
  agentWorld.bodies = [];
  agentWorld.isLIFO = true;
  agentWorld.serviceTime = 3.0;
  agentWorld.spawnTime = 2.0;
  agentWorld.spawnVariance = 2.0;
  agentWorld.frusTime = 100.0;
  agentWorld.frusVariance = 5.0;

  q = new AgentQueue({}, agentWorld);
  agentWorld.q = q;

  // attach callback
  Matter.Events.on(engine, "beforeTick",  beforePhysicsTick) 

  // run the engine
  Engine.run(engine);

  // create params
  params = {
    arrivalRate: 0.1,
    serviceRate: 0.1
  }

  // create gui
  gui = new dat.GUI();
  gui.add(params, 'arrivalRate', 0, 1.5);
  gui.add(params, 'serviceRate', 0, 1.5);
}

function pruneAgents() {
  var newagents = [];

  for(var i = 0; i < agents.length; ++i) {
    var pos = agents[i].body.position;
    if(pos.x < -100 || pos.y > 600 || pos.x > 800 || pos.x < -100) {
      console.log("Removing agent!");
      q.leave(agents[i]); // just to be safe
      Matter.World.remove(engine.world, agents[i].body);
    } else {
      newagents.push(agents[i]);
    }
  }
  agents = newagents;
}

function spawnAgent() {
  var x = Math.random() * 800;
  var y = Math.random() * 200;

  var ftime = agentWorld.frusTime + (Math.random()*2.0 - 1.0)*agentWorld.frusVariance;

  var newagent = new Agent({x: x, y: y, frustrationTime: ftime}, agentWorld);
  agents.push(newagent);
  q.enter(newagent);
}

function spawnAgents() {
  if(agents.length >= 20) {
    return;
  }

  stime = stime + (TIMESTEP / 1000.0);

  if(stime > nextSpawnTime) {
    //console.log("Spawning an agent...");
    spawnAgent();
    stime = 0.0;
    nextSpawnTime = agentWorld.spawnTime + (Math.random()*2.0 - 1.0)*agentWorld.spawnVariance;
  }
}

function beforePhysicsTick() {
  q.update(TIMESTEP);
  spawnAgents();
  pruneAgents();

  agentWorld.bodies = [];
  for(var i = 0; i < agents.length; ++i) {
    agentWorld.bodies.push(agents[i].body)
  }

  for(var i = 0; i < agents.length; ++i) {
    agents[i].update(TIMESTEP);
  }
}

$(function(){
  init();
});