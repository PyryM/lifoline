function Agent(options, world) {
  this.options = {
    force: 0.5,
    density: 1.0,
    damping: 0.05,
    x: 0,
    y: 0,
    rad: 15,
    forwardLook: 40,
    lookWidth: 40,
    frustrationTime: 20.0,
    cheatyness: 0.5,
    reenterPause: 5.0
  }
  $.extend(this.options, options);

  this.engine = world.engine;
  this.target = {x: 400, y: 300};
  this.world = world;

  this.avoidingCollisions = false;

  this.inQueue = false;
  this.reentering = false;
  this.queuePosition = 0;
  this.waitTime = 0.0;

  this.createBody();
}

Agent.prototype.createBody = function() {
  this.body = Matter.Bodies.circle(this.options.x, this.options.y,
                               this.options.rad,
                               {density: this.options.density});
  this.body.frictionAir = this.options.damping;
  Matter.World.add(this.engine.world, [this.body]);
}

Agent.prototype.checkFront = function(fpos) {
  var infront = Matter.Query.ray(this.world.bodies, this.body.position, fpos,
                                 this.options.lookWidth);
  return (infront.length > 1); // we'll always see ourself 
};

Agent.prototype.goToBack = function() {
  this.waitTime = 0.0;
  this.world.q.leave(this);
  this.target = this.world.q.getReenterTarget();
  this.reentering = true;
};

Agent.prototype.giveUp = function() {
  this.world.q.leave(this);
  this.target = this.world.q.getExitTarget();
};

Agent.prototype.reenterQueue = function() {
  this.inQueue = true;
  this.reentering = false;
  this.world.q.enter(this);
};

Agent.prototype.updateQueuePosition = function(targetpos, queuepos) {
  this.target = targetpos;
  this.queuePosition = queuepos;
  if(queuepos < 0) { // we're being serviced!
    this.inQueue = false;
  }
};

Agent.prototype.updateAI = function(dt) {
  this.waitTime += (dt / 1000.0);
  if(this.inQueue) {
    //this.avoidingCollisions = true;

    if(this.waitTime > this.options.frustrationTime) {
      this.inQueue = false;
      if(Math.random() < this.options.cheatyness) {
        this.goToBack();
      } else {
        this.giveUp();
      }
    }
  } else {
    this.avoidingCollisions = false;
    if(this.reentering === true && this.waitTime > this.options.reenterPause) {
      this.reenterQueue();
    }
  }

  var dv = Matter.Vector.sub(this.target, this.body.position);
  dv = Matter.Vector.normalise(dv);

  var forwardVec = Matter.Vector.mult(dv, this.options.forwardLook);
  var fpos = Matter.Vector.add(this.body.position, forwardVec);

  this.blocked = this.checkFront(fpos);
  this.targetVec = dv;
};

Agent.prototype.updatePhysics = function(dt) {
  var dv = Matter.Vector.mult(this.targetVec, this.options.force);

  // don't apply force if we see something in front of us
  if( !(this.blocked) || !(this.avoidingCollisions) ){
    Matter.Body.applyForce(this.body, this.body.position, dv);
  }
};

Agent.prototype.update = function(dt) {
  this.updateAI(dt);
  this.updatePhysics(dt);
}