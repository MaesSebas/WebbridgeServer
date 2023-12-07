var app = new Vue({
    el: '#app',
    data: {
      connected: false,
      ros: null,
      //ws_address: 'ws://localhost:9090',
      //ws_address: 'ws://192.168.1.113:9090',
      ws_address: 'ws://192.168.1.48:9090',
      topic: null,
      message: null,
      receivedMessages: [] 
  
    },

    created: function () {
      this.connect();
      this.setTopicListener();
    },
  
    methods: {

        connect: function(){
            console.log('Did you connect to rosbridge?');
            this.ros = new ROSLIB.Ros({
              url : this.ws_address
            });

            this.ros.on('connection', () => {
              console.log('Connected!');
              document.getElementById("connectStatus").style.color = "green";
              document.getElementById("connectStatus").innerHTML = "Connected!";
              this.connected = true;
            });
          
            this.ros.on('error', (error) => {
              document.getElementById("connectStatus").style.color = "red";
              document.getElementById("connectStatus").innerHTML = "Failed to connect."
              console.log('Error connecting to websocket server: ', error);
            });
          
            this.ros.on('close', () => {
              console.log('Connection to websocket server closed.');
              this.connected = false;
            })
        },
  
        disconnect: function(){
          this.ros.close();
        },

        setTopicListener: function () {
          const my_topic_listener = new ROSLIB.Topic({
            ros: this.ros,
            name: "/Test",
            messageType: "std_msgs/String",
          });
    
          my_topic_listener.subscribe((message) => {
            this.receivedMessages.push(message.data);
            console.log(this.receivedMessages)
          });
        },
  

        /*
        setTopic: function(){
          this.topic = new ROSLIB.Topic({
            ros : this.ros,
            name : '/Led',
            //messageType : 'std_msgs/String'
            messageType : 'std_msgs/Int32'
          })
        },
        */

        setTopicc: function(){
          this.topic = new ROSLIB.Topic({
            ros : this.ros,
            name : '/Pointie',
            messageType : 'geometry_msgs/Point'
          })
        },
  
        ledAan: function(){
          this.message = new ROSLIB.Message({
              data: 1
          });
          //this.setTopic();
          this.setTopicc();
          document.getElementById("publishLog").innerHTML += JSON.stringify(this.message) + "<br>";
          this.topic.publish(this.message);
        },

        ledUit: function(){
          this.message = new ROSLIB.Message({
              data: 0
          });
          //this.setTopic();
          this.setTopicc();
          document.getElementById("publishLog").innerHTML += JSON.stringify(this.message) + "<br>";
          this.topic.publish(this.message);
        },

        sendValue: function () {
          this.message = new ROSLIB.Message({
            x: parseFloat(this.x),
            y: parseFloat(this.y),
            z: parseFloat(this.z)
          });
          this.setTopicc();
          document.getElementById("publishLog").innerHTML += JSON.stringify(this.message) + "<br>";
          this.topic.publish(this.message);
        },
  
  
      }
  })