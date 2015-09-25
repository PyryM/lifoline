function Agent(options, world) {
  this.options = {
    force: 1.0,
    density: 1.0,
    damping: 0.05,
    x: 0,
    y: 0,
    rad: 20
  }
  $.extend(this.options, options);

  this.engine = world.engine;
  this.target = {x: 400, y: 300};

  this.createBody();
}

Agent.prototype.createBody = function() {
  this.body = Matter.Bodies.rectangle(this.options.x, this.options.y,
                               this.options.rad*2, this.options.rad*2,
                               {density: this.options.density});
  this.body.frictionAir = this.options.damping;
  Matter.World.add(this.engine.world, [this.body]);
}

Agent.prototype.update = function() {
  var dv = Matter.Vector.sub(this.target, this.body.position);
  dv = Matter.Vector.normalise(dv);
  dv = Matter.Vector.mult(dv, this.options.force);
  Matter.Body.applyForce(this.body, this.body.position, dv);
}