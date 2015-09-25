function AgentQueue(options, world) {
  this.world = world;
  this.options = {
    spacing: 50,
    x0: 100,
    y0: 300,
  }
  $.extend(this.options, options);

  this.timeleft = world.serviceTime;
  this.queue = [];
  this.createTargets();
}

AgentQueue.prototype.createTargets = function() {
  // create queue positions
  this.qpos = [];
  var x0 = this.options.x0;
  var y0 = this.options.y0;
  var dx = this.options.spacing;
  for(var i = 0; i < 60; ++i) {
    this.qpos.push({x: x0 + i*dx, y: y0});
  }

  this.waitZone = {x: 100, y: 300, w: 400, h: 200};

  this.exitTarget = {x: 400, y: 5000};

  this.FIFOserviceTarget = {x: -5000, y: this.options.y0};
  this.LIFOserviceTarget = {x: 5000, y: this.options.y0};
};

AgentQueue.prototype.getExitTarget = function() {
  return this.exitTarget;
};

AgentQueue.prototype.getReenterTarget = function() {
  var x = Math.random()*this.waitZone.w + this.waitZone.x;
  var y = Math.random()*this.waitZone.h + this.waitZone.y;
  return {x: x, y: y};
};

AgentQueue.prototype.removeAgent = function(agent) {
  var queue = this.queue;
  for (var i = queue.length-1; i >= 0; i--) {
    if (queue[i] === agent) {
      queue.splice(i, 1);
      break;
    }
  }
};

AgentQueue.prototype.enter = function(agent) {
  this.queue.push(agent);
  agent.inQueue = true;
};

AgentQueue.prototype.leave = function(agent) {
  this.removeAgent(agent);
  agent.inQueue = false;  
};

AgentQueue.prototype.serviceAgent = function() {
  //console.log("Servicing an agent...");

  if(this.queue.length == 0) {
    return;
  }

  var spos;
  var tgt;
  if(this.world.isLIFO) {
    tgt = this.queue[this.queue.length - 1];
    spos = this.LIFOserviceTarget;
  } else {
    tgt = this.queue[0];
    spos = this.FIFOserviceTarget;
  }

  this.removeAgent(tgt);
  tgt.updateQueuePosition(spos, -1);
};

AgentQueue.prototype.update = function(dt) {
  var q = this.queue;
  var targets = this.qpos;
  for(var i = 0; i < q.length; ++i) {
    q[i].updateQueuePosition(targets[i], i);
  }

  this.timeleft -= (dt / 1000.0);
  if(this.timeleft < 0.0) {
    this.serviceAgent();
    this.timeleft = this.world.serviceTime;
  }
};