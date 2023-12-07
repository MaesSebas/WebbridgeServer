import rclpy
from std_msgs.msg import String
import time

def publish_to_ros2_topic():
    rclpy.init()
    node = rclpy.create_node('websocket_publisher')

    # Replace '192.168.1.47' with the IP address of your remote machine
    # Replace '/DikkeLul' with your actual topic
    remote_ip = '192.168.1.48'
    topic_name = '/DikkeLul'

    # Set ROS_MASTER_URI to the remote machine's IP
    node.set_parameters([rclpy.parameter.Parameter('ros__parameters', 'ros_master_uri', f'http://{remote_ip}:9090')])

    publisher = node.create_publisher(String, topic_name, 10)

    while rclpy.ok():
        # Replace 'Your_Message_Here' with the actual message you want to publish
        message_content = 'Your_Message_Here'

        msg = String()
        msg.data = message_content

        publisher.publish(msg)
        node.get_logger().info(f"Publishing to {topic_name}: {message_content}")

        # Wait for one second before publishing the next message
        time.sleep(1)

if __name__ == '__main__':
    publish_to_ros2_topic()
