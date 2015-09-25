function Agent(options, world) {
  this.options = {
    force: 1.0,
    density: 1.0,
    damping: 0.15,
    x: 0,
    y: 0,
    rad: 15,
    forwardLook: 30,
    lookWidth: 30,
    frustrationTime: 20.0,
    cheatyness: 0.5,
    reenterPause: 5.0,
    reactionTime: 0.2
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

  this.freezeTime = 0.0;

  this.errorFrames = 0;

  this.createBody();
}

Agent.prototype.createBody = function() {
  this.body = Matter.Bodies.circle(this.options.x, this.options.y,
                               this.options.rad,
                               {density: this.options.density});
  this.body.frictionAir = this.options.damping;
  Matter.World.add(this.engine.world, [this.body]);
  console.log("created body?");
}

Agent.prototype.checkFront = function(fpos) {
  var infront = Matter.Query.ray(this.world.bodies, this.body.position, fpos,
                                 this.options.lookWidth);
  return (infront.length > 1); // we'll always see ourself 
};

Agent.prototype.goToBack = function() {
  console.log("Agent trying to cheat by going to back of line.");
  this.waitTime = 0.0;
  this.world.q.leave(this);
  this.target = this.world.q.getReenterTarget();
  this.reentering = true;
};

Agent.prototype.giveUp = function() {
  console.log("Agent leaving.");
  this.world.q.leave(this);
  this.target = this.world.q.getExitTarget();
};

Agent.prototype.reenterQueue = function() {
  this.inQueue = true;
  this.reentering = false;
  this.world.q.enter(this);
  this.waitTime = 0.0;
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
  this.targetDist = Math.sqrt(dv.x*dv.x + dv.y*dv.y);
  dv = Matter.Vector.normalise(dv);

  if(this.inQueue && this.targetDist < this.options.rad) {
    this.avoidingCollisions = true;
  }

  if(this.targetDist > this.options.rad * 3.0) {
    this.errorFrames += 1;
  } else {
    this.errorFrames = 0;
  }

  if(this.errorFrames > 300) {
    this.avoidingCollisions = false;
  }

  var forwardVec = Matter.Vector.mult(dv, this.options.forwardLook);
  var fpos = Matter.Vector.add(this.body.position, forwardVec);

  var frontblocked = this.checkFront(fpos);
  if(frontblocked) {
    this.freezeTime = this.options.reactionTime;
  }

  this.blocked = frontblocked || (this.freezeTime > 0.0);
  this.freezeTime -= (dt / 1000.0);
  this.targetVec = dv;
};

Agent.prototype.updatePhysics = function(dt) {
  var f = Math.min(this.targetDist * 0.01, this.options.force);
  var dv = Matter.Vector.mult(this.targetVec, f);

  // don't apply force if we see something in front of us
  if( !(this.blocked) || !(this.avoidingCollisions) ){
    Matter.Body.applyForce(this.body, this.body.position, dv);
  }
};

Agent.prototype.update = function(dt) {
  this.updateAI(dt);
  this.updatePhysics(dt);
}