# ros2WebPage

This project is a ROS2 dashboard built with React. It wraps the existing HTML/JavaScript implementation into a modern React application.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

The dashboard connects to the ROS bridge on port 5010 by default. Modify the `connectToROS` call in `src/dashboard.js` if you need a different port.

## Graph view

The dashboard visualizes ROS nodes and their topics in an interactive graph.
Each topic is displayed as a small node and arrows illustrate publish or
subscribe links, providing a blueprint-like overview of message flow.
