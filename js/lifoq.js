var engine;
var gui;
var params;
var TIMESTEP = 1000.0 / 60.0;
var agents = [];
var agentWorld = {};
var q;

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
  agentWorld.isLIFO = false;
  agentWorld.serviceTime = 10.0;

  q = new AgentQueue({}, agentWorld);
  agentWorld.q = q;

  // create some agents
  for(var i = 0; i < 10; ++i) {
    var x = Math.random() * 800;
    var y = Math.random() * 600;
    var newagent = new Agent({x: x, y: y}, agentWorld);
    agents.push(newagent);
    q.enter(newagent);
  }

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
    var ll = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    if(pos.x < -100 || pos.y > 600) {
      console.log("Removing agent!");
      q.leave(agents[i]); // just to be safe
      Matter.World.remove(engine.world, agents[i].body);
    } else {
      newagents.push(agents[i]);
    }
  }
  agents = newagents;
}

function beforePhysicsTick() {
  q.update(TIMESTEP);
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