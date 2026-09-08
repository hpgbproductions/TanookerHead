# TanookerHead

Test p5.js project. It's a small tanuki-shaped spring-damper system that sways around depending on the location of your mouse. Maybe in the future, it will move depending on how you drive a train.

The original tanuki template was made by [Haruyuki Tanukiji](https://x.com/haruyukitanuki) and can be found [here](https://x.com/haruyukitanuki/status/2066058644123521194). The tanuki assets are available under the CC BY-NC-SA 4.0 license.

## Controls

Mouse controls are only available when `DEBUG_MOUSE` is `true`.

- Cursor position: Set target position of the system.
- Click: Stop oscillations and set the position of the system.
- Double click: Toggle between physics and direct control modes.

## Settings

There are many settings variables at the top of `sketch.js`:

| Debug | |
| :--- | :--- |
| `DEBUG_DRAW` | `Boolean`: Enable drawing of the tanuki. |
| `DEBUG_MOUSE` | `Boolean`: Enable mouse controls. |
| `DEBUG_OVERLAY` | `Boolean`: Enable drawing of the debug overlay. |
| `DEBUG_RADIUS` | `Number`: A mouse offset of this number of pixels corresponds to one unit of distance. |
| `DEBUG_DIRECT` | `Boolean`: Override physics and control movement directly. |

| General | |
| :--- | :--- |
| `FPS` | `Number`: Maximum framerate. |
| `SIZE` | `Integer`: Height in pixels. |
| `ASPECT_RATIO` | `Number`: Width divided by height. |
| `DAMPER` | `Number [s^-1]` |
| `SPRING` | `Number [s^-2]` |
| `MAX_DELTATIME` | `Number [ms]` |
| `MAX_DRAW_MAG` | `Number [unit/s]`: Maximum distance of the system that can be drawn. |

| Face | |
| :--- | :--- |
| `BLINK_DURATION` | `Number [ms]` |
| `BLINK_INTERVAL_MIN` | `Number [ms]` |
| `BLINK_INTERVAL_MAX` | `Number [ms]` |
| `SCARED_POSITION_MAG` | `Number [unit]` |
| `SCARED_VELOCITY_MAG` | `Number [unit/s]` |
| `SCARED_DURATION` | `Number [ms]` |

## Running Locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"
```

## Resources

- [p5.js 2.0](https://beta.p5js.org/)
- [p5.js Reference](https://p5js.org/reference/)
