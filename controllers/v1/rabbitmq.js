const config = require('./../config');
const amqp = require('amqplib');

class RabbitMQ{
  constructor(){}

  //create connection to broker, open channel
  async connect(){
    this.connection = await amqp.connect(config.rabbitmq.host);
    if(this.connection){
      this.channel = await this.connection.createChannel();
      if(this.channel){
        this.channel.assertQueue(config.rabbitmq.queue,{durable:true});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

/*
  @param - payload - key/value pairs for job
  Description: start job on worker server, send to broker
*/
  async startJob(payload){
    if(!payload){
      return false;
    }
    this.channel.sendToQueue(config.rabbitmq.queue, Buffer.from(JSON.stringify(payload)));
    setTimeout(() => { this.connection.close(); }, 500);
  }
}

module.exports = RabbitMQ;
