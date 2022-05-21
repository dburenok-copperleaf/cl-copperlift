# The Copperlift (Elevator Control)

## A Dev Kata Day project from Team 3 on May 20, 2022

### Technical specs:
- Built using Replit, a free tool for real-time collaborative development
- Considered a number of approaches that would suit our team composition the best, and settled on HTML/vanilla JavaScript to maximize learning opportunities 

### Design:
- Two app modes, Interactive and Simulation
- Interactive mode allows you to move the elevator to the desired floor
- Simulation mode performs a simulation of the elevator being called by many different people
    - for now this mode is sequential, meaning the a customer has to wait for the previous ride to finish before getting their turn
    - we can improve the design by allowing intelligent decision making on which requests to take first (to minimize travel time) and later allow multiple people to ride together
- We are also collecting metrics on the distance travelled by increasing a distance counter whenever the elevator is in motion
    - as well as a number of users served, a metric we named **Smiles Delivered**
   
