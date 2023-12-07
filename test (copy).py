import rclpy
from std_msgs.msg import String
import time

def publish_to_ros2_topic():
    rclpy.init()
    node = rclpy.create_node('websocket_publisher')

    # Replace '/DikkeLul' with your actual topic
    topic_name = '/DikkeLul'

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
