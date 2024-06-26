  const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Define image URLs
        const SPACE = new Image();
        SPACE.src = "imgs/space.jpg";
        SPACE.onload = () => {
            canvas.width = SPACE.width;
            canvas.height = SPACE.height;
            draw();
        };

        const TRACK = new Image();
        TRACK.src = "imgs/track.png";
        TRACK.onload = () => {
            draw();
        };

        const FINISH = new Image();
        FINISH.src = "imgs/finish.png";
        FINISH.onload = () => {
            draw();
        };

        const GREEN_ROCKET = new Image();
        GREEN_ROCKET.src = "imgs/green-rocket.png";
        GREEN_ROCKET.onload = () => {
            draw();
        };

        const MAIN_FONT = "44px sans-serif"; // Fixed the typo

        // Game logic variables
        const gameInfo = {
            level: 1,
            getLevelTime() {
                // Your logic to get the level time
                return 60; // Example time
            }
        };

        const FPS = 60; // Frames per second
        const frameDelay = 1000 / FPS; // Delay between frames in milliseconds
        let lastFrameTime = 0;

        const playerCar = {
            x: 130,
            y: 140,
            angle: 0,
            vel: 5, // Initial velocity
            image: GREEN_ROCKET
        };

        function draw() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the background and other static elements
            ctx.drawImage(SPACE, 0, 0, SPACE.width, SPACE.height);

            // Scale and draw the track
            ctx.drawImage(TRACK, 0, 0, SPACE.width, SPACE.height);

            // Scale and draw the finish line
            ctx.drawImage(FINISH, 130 * (SPACE.width / 800), 250 * (SPACE.height / 600),  // Adjusted positions and sizes
                FINISH.width * (SPACE.width / 800), FINISH.height * (SPACE.height / 600));

            // Draw the scaled player's car
            drawRotatedImage(playerCar.image, playerCar.x, playerCar.y, playerCar.angle, 0.20); // Adjusted scale

            // Check for collisions between player's car and track boundaries
            checkCollision(playerCar);
        }

        // Function to draw a rotated and scaled image
        function drawRotatedImage(image, x, y, angle, scale) {
            ctx.save(); // Save the current canvas state
            ctx.translate(x, y); // Translate to the image center
            ctx.rotate(angle * Math.PI / 180); // Rotate
            ctx.scale(scale, scale); // Scale
            ctx.drawImage(image, -image.width / 2, -image.height / 2); // Draw the image centered
            ctx.restore(); // Restore the saved canvas state
        }

        // Function to check for collision between a car and track boundaries
        function checkCollision(car) {
            if (car.x < 0 || car.x > canvas.width || car.y < 0 || car.y > canvas.height) {
                // Collision detected with track boundary
                console.log("Collision detected with track boundary!");
                // Implement actions to handle collision (e.g., reset car position)
            }
        }

        // Main game loop
        function gameLoop(currentTime) {
            // Calculate time difference since the last frame
            const deltaTime = currentTime - lastFrameTime;

            // Check if it's time to update the frame
            if (deltaTime > frameDelay) {
                // Update the last frame time
                lastFrameTime = currentTime - (deltaTime % frameDelay);

                // Redraw the canvas with updated positions
                draw();
            }

            // Request the next frame
            requestAnimationFrame(gameLoop);
        }

        // Start the game loop
        requestAnimationFrame(gameLoop);

        // Add event listener for keyboard input to control player's car
        document.addEventListener("keydown", handleKeyDown);

        function handleKeyDown(event) {
            // Example: varied keys control the player's car movement
            switch (event.key) {
                case "w":
                    // Move forward
                    movePlayerCar(playerCar.vel);
                    break;
                case "d":
                    // Move backward (optional)
                    movePlayerCar(-playerCar.vel / 2); // Reduce speed when moving backward
                    break;
                case "k":
                    // Rotate left
                    playerCar.angle -= 5; // Adjust rotation angle as needed
                    break;
                case "l":
                    // Rotate right
                    playerCar.angle += 5; // Adjust rotation angle as needed
                    break;
                default:
                    break;
            }
        }

        function movePlayerCar(velocity) {
            // Calculate new position based on velocity and angle
            playerCar.x += velocity * Math.sin(playerCar.angle * Math.PI / 180);
            playerCar.y -= velocity * Math.cos(playerCar.angle * Math.PI / 180);

            // Optional: Implement boundary checking to keep the car within the track
            // Example: Check if the new position is within the canvas boundaries

            // Redraw the canvas with the updated positions
            draw();
        }
