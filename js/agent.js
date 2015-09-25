function Agent(options, world) {
  this.options = {
    force: 0.2,
    density: 1.0,
    damping: 0.05,
    x: 0,
    y: 0,
    rad: 20,
    forwardLook: 40,
    lookWidth: 40
  }
  $.extend(this.options, options);

  this.engine = world.engine;
  this.target = {x: 400, y: 300};
  this.world = world;

  this.createBody();
}

Agent.prototype.createBody = function() {
  this.body = Matter.Bodies.rectangle(this.options.x, this.options.y,
                               this.options.rad*2, this.options.rad*2,
                               {density: this.options.density});
  this.body.frictionAir = this.options.damping;
  Matter.World.add(this.engine.world, [this.body]);
}

Agent.prototype.checkFront = function(fpos) {
  var infront = Matter.Query.ray(this.world.bodies, this.body.position, fpos,
                                 this.options.lookWidth);
  return (infront.length > 1); // we'll always see ourself 
};

Agent.prototype.update = function() {
  var dv = Matter.Vector.sub(this.target, this.body.position);
  dv = Matter.Vector.normalise(dv);

  var forwardVec = Matter.Vector.mult(dv, this.options.forwardLook);
  dv = Matter.Vector.mult(dv, this.options.force);

  var fpos = Matter.Vector.add(this.body.position, forwardVec);

  // don't apply force if we see something in front of us
  if( !(this.checkFront(fpos)) ){
    Matter.Body.applyForce(this.body, this.body.position, dv);
  }
}