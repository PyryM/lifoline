var engine;
var gui;
var params;
var TIMESTEP = 1000.0 / 60.0; 

function init() {
  // Matter.js module aliases
  var Engine = Matter.Engine,
      World = Matter.World,
      Bodies = Matter.Bodies;

  // create a Matter.js engine
  engine = Engine.create(document.body);

  // create two boxes and a ground
  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  World.add(engine.world, [boxA, boxB, ground]);

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
  //console.log("BTICK");
}

$(function(){
  init();

});