            const canvas = document.getElementById("gameCanvas");
            const ctx = canvas.getContext("2d");

            // Define image URLs
            const SPACE = new Image();
            SPACE.src = "imgs/space.jpg";

            const TRACK = new Image();
            TRACK.src = "imgs/track.png";

            const TRACK_BORDER = new Image();
            TRACK_BORDER.src = "imgs/track-border.png";

            const FINISH = new Image();
            FINISH.src = "imgs/finish.png";

            const GREEN_ROCKET = new Image();
            GREEN_ROCKET.src = "imgs/green-rocket.png";

            const ORANGE_ROCKET = new Image();
            ORANGE_ROCKET.src = "imgs/orange-rocket.png";

            const MAIN_FONT = "44px sans-serif";

            const PATH = [
                [150, 100],
                [100, 400],
                [500, 200],
                [600, 500],
                [300, 500],
                [100, 300]
            ];

            class GameInfo {
                constructor() {
                    this.LEVELS = 10;
                    this.level = 1;
                    this.started = false;
                    this.level_start_time = 0;
                }

                next_level() {
                    this.level += 1;
                    this.started = false;
                }

                reset() {
                    this.level = 1;
                    this.started = false;
                    this.level_start_time = 0;
                }

                game_finished() {
                    return this.level > this.LEVELS;
                }

                start_level() {
                    this.started = true;
                    this.level_start_time = Date.now();
                }

                get_level_time() {
                    if (!this.started) return 0;
                    return Math.round((Date.now() - this.level_start_time) / 1000);
                }
            }

            class AbstractCar {
                constructor(max_vel, rotation_vel, img, start_pos) {
                    this.img = img;
                    this.max_vel = max_vel;
                    this.vel = 0;
                    this.rotation_vel = rotation_vel;
                    this.angle = 0;
                    this.x = start_pos[0];
                    this.y = start_pos[1];
                    this.acceleration = 0.1;
                }

                rotate(left = false, right = false) {
                    if (left) {
                        this.angle += this.rotation_vel;
                    } else if (right) {
                        this.angle -= this.rotation_vel;
                    }
                }

                draw() {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.angle);
                    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
                    ctx.restore();
                }

                move_forward() {
                    this.vel = Math.min(this.vel + this.acceleration, this.max_vel);
                    this.move();
                }

                move_backward() {
                    this.vel = Math.max(this.vel - this.acceleration, -this.max_vel / 2);
                    this.move();
                }

                move() {
                    const radians = this.angle * (Math.PI / 180);
                    const vertical = Math.cos(radians) * this.vel;
                    const horizontal = Math.sin(radians) * this.vel;
                    this.y -= vertical;
                    this.x -= horizontal;
                }

                collide(mask, x = 0, y = 0) {
                    const car_mask = new ImageData(this.img.width, this.img.height);
                    ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
                    const car_pixels = ctx.getImageData(0, 0, this.img.width, this.img.height);
                    car_mask.data.set(car_pixels.data);
                    const poi = overlapMask(car_mask, mask, this.x - x, this.y - y);
                    return poi;
                }

                reset() {
                    this.x = this.START_POS[0];
                    this.y = this.START_POS[1];
                    this.angle = 0;
                    this.vel = 0;
                }
            }

            class PlayerCar extends AbstractCar {
                constructor() {
                    super(4, 4, GREEN_ROCKET, [180, 200]);
                }

                reduce_speed() {
                    this.vel = Math.max(this.vel - this.acceleration / 2, 0);
                    this.move();
                }

                bounce() {
                    this.vel = -this.vel;
                    this.move();
                }
            }

            class ComputerCar extends AbstractCar {
                constructor() {
                    super(1, 4, ORANGE_ROCKET, [150, 200]);
                    this.path = PATH;
                    this.current_point = 0;
                    this.vel = 1;
                }

                calculate_angle() {
                    const [target_x, target_y] = this.path[this.current_point];
                    const x_diff = target_x - this.x;
                    const y_diff = target_y - this.y;
                    return (Math.atan2(y_diff, x_diff) * 180) / Math.PI;
                }

                move() {
                    this.angle = this.calculate_angle();
                    super.move();
                    if (
                        Math.abs(this.x - this.path[this.current_point][0]) < 5 &&
                        Math.abs(this.y - this.path[this.current_point][1]) < 5
                    ) {
                        this.current_point = (this.current_point + 1) % this.path.length;
                    }
                }
            }

            // Define utility functions
            function scaleImage(img, factor) {
                const width = Math.round(img.width * factor);
                const height = Math.round(img.height * factor);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                return canvas;
            }

            function blitRotateCenter(ctx, image, topLeft, angle) {
                ctx.save();
                ctx.translate(topLeft[0] + image.width / 2, topLeft[1] + image.height / 2);
                ctx.rotate(angle * Math.PI / 180);
                ctx.drawImage(image, -image.width / 2, -image.height / 2);
                ctx.restore();
            }

            function blitTextCenter(ctx, font, text, x, y) {
                ctx.font = font;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgb(200, 200, 200)';
                ctx.fillText(text, x, y);
            }

            function overlapMask(mask1, mask2, offsetX = 0, offsetY = 0) {
                for (let y = 0; y < mask1.height; y++) {
                    for (let x = 0; x < mask1.width; x++) {
                        const index = (y * mask1.width + x) * 4;
                        const r = mask1.data[index];
                        const g = mask1.data[index + 1];
                        const b = mask1.data[index + 2];
                        const a = mask1.data[index + 3];
                        if (a !== 0) {
                            const overlappingPixel = mask2.data.slice(index, index + 4);
                            if (overlappingPixel.every(val => val === 0)) {
                                return [x + offsetX, y + offsetY];
                            }
                        }
                    }
                }
                return null;
            }

            function handle_collision() {
                const car_position = player_car.collide(TRACK_BORDER_MASK, 0, 0);
                if (car_position) {
                    player_car.bounce();
                }

                const computer_position = computer_car.collide(TRACK_BORDER_MASK, 0, 0);
                if (computer_position) {
                    computer_car.bounce();
                }
            }

            function gameLoop() {
                handle_collision();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(SPACE, 0, 0);
                ctx.drawImage(TRACK, 0, 0);
                ctx.drawImage(FINISH, 130, 250);
                ctx.drawImage(TRACK_BORDER, 0, 0);

                player_car.draw();
                computer_car.draw();

                requestAnimationFrame(gameLoop);
            }

            // Game setup
            const game_info = new GameInfo();
            const player_car = new PlayerCar();
            const computer_car = new ComputerCar();

            // Load track mask
            const TRACK_BORDER_MASK = new Image();
            TRACK_BORDER_MASK.onload = () => {
                gameLoop();
            };
            TRACK_BORDER_MASK.src = "imgs/track-border-mask.png";

            document.addEventListener("keydown", (event) => {
                if (!game_info.started) {
                    game_info.start_level();
                }

                switch (event.code) {
                    case "ArrowUp":
                        player_car.move_forward();
                        break;
                    case "ArrowDown":
                        player_car.reduce_speed();
                        break;
                    case "ArrowLeft":
                        player_car.rotate(left = true);
                        break;
                    case "ArrowRight":
                        player_car.rotate(right = true);
                        break;
                }
            });

            document.addEventListener("keyup", (event) => {
                switch (event.code) {
                    case "ArrowLeft":
                    case "ArrowRight":
                        player_car.rotate();
                        break;
                }
            });
        
