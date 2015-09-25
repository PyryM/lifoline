var engine;
var gui;
var params;
var TIMESTEP = 1000.0 / 60.0;
var agents = [];
var agentWorld = {};

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

  // create some agents
  for(var i = 0; i < 30; ++i) {
    var x = Math.random() * 800;
    var y = Math.random() * 600;
    agents.push(new Agent({x: x, y: y}, agentWorld));
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

function beforePhysicsTick() {
  agentWorld.bodies = [];
  for(var i = 0; i < agents.length; ++i) {
    agentWorld.bodies.push(agents[i].body)
  }

  for(var i = 0; i < agents.length; ++i) {
    agents[i].update();
  }
}

$(function(){
  init();
});