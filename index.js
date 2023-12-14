var app = new Vue({
  el: '#app',
  data: {
    connected: false,
    ros: null,
    topic: null,
    message: null,
    receivedMessages: [],
    selectedAddress: null,
    availableTopics: [],
    selectedTopic: '',
    topicMessageTypes: {},
    data: null,
    mytopic: null,
    camera_topic: null,
    x: 0,
    y: 0,
    z: 0,
    batteryLevel: -1,
    batteryTopicName: "/Battery",
    cameraTopicName: "/image_raw/compressed",
    intervals: {},
  },

  created: function () {
    this.changeWsAddress("ws://192.168.1.48:9090");
  },

  methods: {
    //functie om een lijst van topics op te halen
    fetchTopics: function () {
      const topicRequest = new ROSLIB.ServiceRequest();

      const service = new ROSLIB.Service({
        ros: this.ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics',
      });

      service.callService(topicRequest, (result) => {
        this.availableTopics = result.topics;
        console.log(result.topics);

        this.availableTopics.forEach((topic) => {
          this.fetchMessageType(topic);
        });
      });
    },
    buttonClicked: function(direction) {
      this.intervals[direction] = setInterval(() => {
        switch (direction) {
          case "up":
            console.log("Up");
            break;
          case "down":
            console.log("Down");
            break;
          case "right":
            console.log("Right");
            break;
          case "left":
            console.log("Left");
            break;
          default:
            console.log("Unknown direction");
        }
        //console.log(`Sending something: ${direction}`);
      }, 10);
      console.log(`set variable: ${direction}`);
    },
    buttonReleased: function(direction) {
      //console.log(`stop variable: ${direction}`);
      clearInterval(this.intervals[direction]);
    },
    //functie om voor elke topic te achterhalen wat de message type is
    fetchMessageType: function (topic) {
      const messageTypeRequest = new ROSLIB.ServiceRequest({
        topic: topic,
      });
  
      const service = new ROSLIB.Service({
        ros: this.ros,
        name: '/rosapi/topic_type',
        serviceType: 'rosapi/TopicType',
      });
  
      service.callService(messageTypeRequest, (result) => {
        // Store the message type for the topic
        this.$set(this.topicMessageTypes, topic, result.type);
        // console.log(result.type)
      });
    },
    // functie die subscribed naar de topic jij kiest van de lijst
    subscribeToTopic: function () {
      // Unsubscribe from the current topic (if any)
      if (this.topic != this.mytopic && this.mytopic != null) {
        this.mytopic.unsubscribe();
      }

      // Subscribe to the selected topic
      this.mytopic = new ROSLIB.Topic({
        ros: this.ros,
        name: this.selectedTopic,
        messageType: this.topicMessageTypes[this.selectedTopic], 
      });

      this.mytopic.subscribe((message) => {
        // Handle different message types
        if (this.selectedTopic === '/Pointie') {
          const data = { x: message.x, y: message.y, z: message.z };
          this.receivedMessages.push(data);
        } else {
          // Handle other message types accordingly
          this.receivedMessages.push(message.data);
        }
        console.log(this.receivedMessages);
      });      
    },

    disconnect: function () {
      this.ros.close();
    },

    clearReceivedMessages: function() {
      this.receivedMessages = [];
    },

    setTopic: function () {
      this.topic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/Led',
        messageType: 'std_msgs/Int32'
      })
    },

    setTopicc: function () {
      this.topic = new ROSLIB.Topic({
        ros: this.ros,
        name: '/Pointie',
        messageType: 'geometry_msgs/Point'
      })
    },

    subToTopicBattery: function(){
      battery_topic = new ROSLIB.Topic({
        ros: this.ros,
        name: this.batteryTopicName,
        messageType: "std_msgs/msg/Float64",
      });

      battery_topic.subscribe((message) => {
        this.batteryLevel = message.data * 100;
        document.getElementById("BatteryLevel").textContent = convertToPercentage;
    });
    },

    subToTopicCamera: function(){
      camera_topic = new ROSLIB.Topic({
        ros: this.ros,
        name: this.cameraTopicName,
        messageType: "sensor_msgs/msg/CompressedImage",
      });

      camera_topic.subscribe((message) => {
        document.getElementById("myimage").src = "data:image/jpg;base64," + message.data;
      });
    },

    ledAan: function () {
      this.message = new ROSLIB.Message({
        data: 1,
      });
      this.setTopic();
      document.getElementById("publishLog").innerHTML += JSON.stringify(this.message) + "<br>";
      this.topic.publish(this.message);
    },

    ledUit: function () {
      this.message = new ROSLIB.Message({
        data: 0
      });
      this.setTopic();
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

    changeWsAddress: function (selectedAddress) {
      if (this.connected) {
        this.disconnect();
      }

      this.ros = new ROSLIB.Ros({
        url: selectedAddress
      });

      this.ros.on('connection', () => {

        this.fetchTopics();
        // console.log('Connected!');
        this.selectedAddress = selectedAddress;

        document.getElementById("connectStatus").style.color = "green";
        document.getElementById("connectStatus").innerHTML = "Connected!";
        this.subToTopicCamera();
        this.subToTopicBattery();
        
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

      if(this.selectedAddress == null)
      {
        document.getElementById("connectStatus").style.color = "red";
        document.getElementById("connectStatus").innerHTML = "Choose a WS address"
        // console.log('ERROR: there is no WS address selected');
      }
    },
  }
})