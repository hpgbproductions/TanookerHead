// debug settings
let DEBUG_DRAW = true;
let DEBUG_MOUSE = true;
let DEBUG_OVERLAY = true;
let DEBUG_RADIUS = 50;
let DEBUG_DIRECT = false;

// general settings
let FPS = 60;
let SIZE = 512;
let ASPECT_RATIO = 0.75;
let DAMPER = 2;
let SPRING = 35;
let MAX_DELTATIME = 200;
let MAX_DRAW_MAG = 8;

// face mode settings
let BLINK_DURATION = 200;
let BLINK_INTERVAL_MIN = 6000;
let BLINK_INTERVAL_MAX = 8000;
let SCARED_POSITION_MAG = 4.2;
let SCARED_VELOCITY_MAG = 15;
let SCARED_DURATION = 1000;

// face mode
let isBlinking = false;
let blinkTimer = BLINK_INTERVAL_MAX;
let isScared = false;
let scaredTimer = 0;

// images
let str_acc_back = "/assets/acc-back-tanuden-hakama.png";
let str_acc_front = "/assets/acc-front-tanuden-hakama.png";;
let str_body = "/assets/body-tanuden-hakama.png";
let str_ears = "/assets/ears-light.png";
let str_face_normal = "/assets/face-light.png";
let str_face_closed = "/assets/face-blink-light.png";
let str_face_scared = "/assets/face-scared-light.png";
let str_head = "/assets/head-light.png";
let str_nose = "/assets/nose-light.png";

let img_acc_back, img_acc_front, img_body, img_ears, img_face_normal, img_face_closed, img_face_scared, img_head, img_nose;
let img_face;    // this points to the currently active face image
let loading_complete = false;

// physics state
let v_error;
let v_target;
let v_position;
let v_velocity;
let v_accel;
let v_draw;
let dt;

async function setup()
{
    // create images
    img_acc_back = await loadImage(str_acc_back);
    img_acc_front = await loadImage(str_acc_front);
    img_body = await loadImage(str_body);
    img_ears = await loadImage(str_ears);
    img_face_normal = await loadImage(str_face_normal);
    img_face_closed = await loadImage(str_face_closed);
    img_face_scared = await loadImage(str_face_scared);
    img_head = await loadImage(str_head);
    img_nose = await loadImage(str_nose);

    // initialize vector variables
    v_error = createVector(0, 0);
    v_target = createVector(0, 0);
    v_position = createVector(0, 0);
    v_velocity = createVector(0, 0);
    v_accel = createVector(0, 0);
    v_draw = createVector(0, 0);

    createCanvas(SIZE * ASPECT_RATIO, SIZE);
    frameRate(FPS);
}

function draw()
{
    background(64, 68, 72);

    if (!loading_complete)
    {
        let num_loaded = 0;
        const num_required = 9;

        if (img_acc_back) num_loaded++;
        if (img_acc_front) num_loaded++;
        if (img_body) num_loaded++;
        if (img_ears) num_loaded++;
        if (img_face_normal) num_loaded++;
        if (img_face_closed) num_loaded++;
        if (img_face_scared) num_loaded++;
        if (img_head) num_loaded++;
        if (img_nose) num_loaded++;

        print(`loaded ${num_loaded}/${num_required}`);

        if (num_loaded === num_required)
        {
            loading_complete = true;
            print("Ready");
        }
        // Skip the draw on this frame
        return;
    }

    //#region update physics
    if (DEBUG_MOUSE)
    {
        v_target.x = (mouseX - width/2) / DEBUG_RADIUS;
        v_target.y = (mouseY - height/2) / DEBUG_RADIUS;
    }
    else
    {
        // from train data...
        v_target.x = 0;
        v_target.y = 0;
    }

    if (DEBUG_DIRECT)
    {
        // Target directly controls position
        v_position = v_target.copy();
    }
    else
    {
        // Physics-based calculation
        dt = min(deltaTime, MAX_DELTATIME);
        v_error = p5.Vector.sub(v_target, v_position);
        v_accel = p5.Vector.sub(p5.Vector.mult(v_error, SPRING), p5.Vector.mult(v_velocity, DAMPER));
        v_velocity.add(p5.Vector.mult(v_accel, (dt/1000)));
        v_position.add(p5.Vector.mult(v_velocity, (dt/1000)));
    }
    //#endregion
    
    //#region draw tanuki
    if (DEBUG_DRAW)
    {
        // Position vector used for drawing has limited magnitude to prevent excess distortion
        v_draw = p5.Vector.limit(v_position, MAX_DRAW_MAG);

        // run blink update
        blinkTimer -= deltaTime;
        if (blinkTimer <= 0)
        {
            isBlinking = !isBlinking;
            blinkTimer = isBlinking ? BLINK_DURATION : random(BLINK_INTERVAL_MIN, BLINK_INTERVAL_MAX);
        }

        // run scaredness update
        if (v_position.mag() > SCARED_POSITION_MAG || v_velocity.mag() > SCARED_VELOCITY_MAG)
        {
            scaredTimer = SCARED_DURATION;
        }
        else
        {
            scaredTimer -= deltaTime;
        }
        isScared = scaredTimer > 0;

        // apply face
        if (isScared)
        {
            img_face = img_face_scared;
        }
        else if (isBlinking)
        {
            img_face = img_face_closed;
        }
        else
        {
            img_face = img_face_normal;
        }

        push(); // store default

        // Apply scale so the height of the screen is 1
        scale(SIZE, SIZE);

        // Set the origin to the foot :skull: position
        translate(0.50 * ASPECT_RATIO, 0.87);

        push(); // store feet-origin unit size system

        // Body acceleration effects
        let body_tr_a = 1;
        let body_tr_b = 0;
        let body_tr_c = -0.005 * v_draw.x;                  // shear X
        let body_tr_d = 1 - 0.001 * abs(v_draw.magSq());    // scale Y
        applyMatrix(body_tr_a, body_tr_b, body_tr_c, body_tr_d, 0, 0);

        // Draw the body while aligning its feet to the origin
        image(img_body, -0.50, -0.87, 1, 1);

        pop(); // restore feet-origin unit size system
        push(); // store feet-origin unit size system

        // Calculate where the neck pivot point (as proportional value) would be using the matrix
        // On untransformed body, neck is at middle of screen or (0, -0.37) from feet
        // [x] = [a c] [+0.00]
        // [y]   [b d] [-0.37]
        let neck_x = body_tr_c * -0.37;
        let neck_y = body_tr_d * -0.37;
        translate(neck_x, neck_y);

        // Head roll effect
        rotate(0.05 * v_draw.x);

        // Draw the head such that its pivot point is roughly on the origin
        // Head pitch effects via parallax
        
        if (v_draw.y > 0)
        {
            // down
            image(img_acc_back, -0.50, -0.50 - 0.000 * v_draw.y, 1, 1);
        }
        else
        {
            // up
            image(img_acc_back, -0.50, -0.50 - 0.020 * v_draw.y, 1, 1);
        }
        
        if (v_draw.y > -2.5)
        {
            image(img_head, -0.50, -0.50 + 0.005 * v_draw.y, 1, 1);
            image(img_ears, -0.50, -0.50 + 0.010 * v_draw.y, 1, 1);
        }
        else
        {
            // Pitched very high up, so ears are behind top of head
            image(img_ears, -0.50, -0.5375 - 0.005 * v_draw.y, 1, 1);
            image(img_head, -0.50, -0.50 + 0.005 * v_draw.y, 1, 1);
        }

        if (v_draw.y > 0)
        {
            // down
            image(img_face, -0.50, -0.50 + 0.010 * v_draw.y, 1, 1);
            image(img_nose, -0.50, -0.50 + 0.0125 * v_draw.y, 1, 1);
            image(img_acc_front, -0.50, -0.50 + 0.010 * v_draw.y, 1, 1);
        }
        else
        {
            // up
            image(img_face, -0.50, -0.50 + 0.0075 * v_draw.y, 1, 1 + 0.010 * v_draw.y);
            image(img_nose, -0.50, -0.50 + 0.020 * v_draw.y, 1, 1);
            image(img_acc_front, -0.50, -0.50 - 0.01 * v_draw.y, 1, 1 + 0.075 * v_draw.y);
        }
        
        pop(); // restore feet-origin unit size system
        pop(); // restore default
    }
    //#endregion

    //#region debug overlay
    if (DEBUG_OVERLAY)
    {
        // Text area
        // Drawn outside of any transform, so coordinates are direct
        fill(255);
        noStroke();
        text("T", 0, 10);
        text("E", 0, 20);
        text("P", 0, 30);
        text("V", 0, 40);
        text("A", 0, 50);
        text("c", 0, 60);
        text("k", 0, 70);
        text(v_target.toString(), 10, 10);
        text(v_error.toString(), 10, 20);
        text(v_position.toString(), 10, 30);
        text(v_velocity.toString(), 10, 40);
        text(v_accel.toString(), 10, 50);
        text(DEBUG_DIRECT ? "(direct)" : DAMPER, 10, 60);
        text(DEBUG_DIRECT ? "(direct)" : SPRING, 10, 70);

        push();
        translate(width/2, height/2);

        noFill();
        stroke(255);
        strokeWeight(1);

        for (let x = 1; x <= 5; x++)
        {
            circle(0, 0, DEBUG_RADIUS * 2 * x);
        }
        line(-width/2, 0, width/2, 0);
        line(0, -height/2, 0, height/2);

        fill(0, 128, 0);
        stroke(255);
        strokeWeight(1);
        circle(v_position.x * DEBUG_RADIUS, v_position.y * DEBUG_RADIUS, 20);

        pop();
    }
    //#endregion
}

// When debugging with mouse, reset the vectors such that the object is stationary at the target position.
function mouseClicked()
{
    if (DEBUG_MOUSE)
    {
        v_error.x = 0;
        v_error.y = 0;

        v_position.x = v_target.x;
        v_position.y = v_target.y;

        v_velocity.x = 0;
        v_velocity.y = 0;

        v_accel.x = 0;
        v_accel.y = 0;
    }
}

// When debugging with mouse, toggle the direct control mode.
function doubleClicked()
{
    if (DEBUG_MOUSE)
    {
        DEBUG_DIRECT = !DEBUG_DIRECT;
    }
}