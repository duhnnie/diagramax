# Diagramax
An extendable javascript library for drawing SVG diagrams.

![diagramax in action](assets/diagramax.gif)

This is a premiliminary version (v0.1.0), I'll be updating it. Documentation will be added in future upates.

## Installation
    npm install diagramax

## Usage

You also can checkout other examples in https://github.com/duhnnie/diagramax-examples

```html
<html>
    <head>
        <link rel="stylesheet" href="css/diagramax.dev.css"/>
        <style>
          /* Custom styles */
          .diagramax.canvas tspan {
            fill: #7a7a7a;
          }

          .diagramax.shape .main-element {
            fill: #F5FDFF;
            stroke: #ABD0D8;
            stroke-width: 3;
          }

          .diagramax.connection .path {
            stroke: #888888;
          }

          .diagramax.connection .arrow {
            fill: #888888;
          }
        </style>
        <script src="js/diagramax.dev.js"></script>
        <script type="text/javascript">
            const circleA = new Diagramax.Circle({
                id: "circleA",
                text: "Circle A",
                x: 49,
                y: 180,
                width: 60,
                height: 60,
            });
            const canvas = new Diagramax.Canvas({
              width: 1440,
              height: 900,
              // We can add shapes at Canvas' instantiating time in two manners: 
              // providing a Shape instance or by providing a Shape object descriptor.
              shapes: [
                circleA,
                {
                  id: "rectB",
                  type: "rectangle",
                  text: "Rect B",
                  data: {},
                  x: 201.5,
                  y: 180,
                  width: 111,
                  height: 80,
                }
              ],
              // We can create connection between Shapes by providing a Shape 
              // instance or a Shape id. Both of them should exist in Canvas.
              connections: [
                {
                  orig: circleA,
                  dest: 'rectB',
                }
              ],
              onChange: (...args) => {
                undoButton.disabled = false;
                redoButton.disabled = true;
              }
            });

            const rectC = new Diagramax.Rectangle({
              id: "rectC",
              type: "rectangle",
              text: "Rect C",
              data: {},
              x: 386,
              y: 180,
              width: 114,
              height: 80
            });

            // Also we can Add shapes after instantiating the Canvas.
            canvas.addShape(rectC);
            canvas.addShape({
              id: "circleD",
              type: "circle",
              text: "Circle D",
              data: {},
              x: 545,
              y: 180,
              width: 60,
              height: 60
            });

            // Connecting shapes is also possible after Canvas instantiation.
            canvas.connect(rectC, 'circleD');
            canvas.connect('rectB', rectC);

            let undoButton;
            let redoButton;
            const undo = () => {
              undoButton.disabled = canvas.undo() === 0;
              redoButton.disabled = false;
            };

            const redo = () => {
              redoButton.disabled = canvas.redo() === 0;
              undoButton.disabled = false;
            }

            document.addEventListener('DOMContentLoaded', function () {
              undoButton = document.querySelector('#undo');
              redoButton = document.querySelector('#redo');
              let connection;
              let counter = 1;

              document.querySelector('#diagram').appendChild(canvas.getElement());
              undoButton.addEventListener('click', undo, false);
              redoButton.addEventListener('click', redo, false);

              document.querySelector('#add').addEventListener('click', () => {
                const selection = document.querySelector('#shape-selector').value;
                const position = { x: 50, y: 50 };
                let shape;

                switch (selection) {
                  case 'Circle':
                    shape = new Diagramax.Circle({
                      text: `Circle #${counter}`,
                      position,
                    });
                    break;
                  case 'Rectangle':
                    shape = new Diagramax.Rectangle({
                      text: `Rectangle #${counter}`,
                      position,
                    });
                    break;
                  case 'Triangle':
                    shape = new Diagramax.Triangle({
                      text: `Triangle #${counter}`,
                      position,
                    });
                    break;
                  case 'Ellipse':
                    shape = new Diagramax.Ellipse({
                      text: `Ellipse #${counter}`,
                      position,
                    });
                    break;
                  default:
                }

                if (shape) {
                  canvas.executeCommand(Diagramax.COMMANDS.SHAPE_ADD, canvas, shape);
                  counter += 1;
                }
              }, false);

              document.querySelector('#data').addEventListener('click', () => {
                console.log(canvas.toJSON());
              }, false);

              // Here we add the undo/redo key binding.
              window.addEventListener('keydown', (event) => {
                switch (event.code) {
                  case 'KeyZ':
                    if (event.ctrlKey) {
                      if (event.shiftKey) {
                        redo();
                      } else {
                        undo();
                      }
                    }
                    break;
                }
              }, false);
            });
        </script>
    </head>
    <body>
      <div id="controls">
        <label>
          Select Shape:
          <select id="shape-selector">
            <option value="Circle">Circle</option>
            <option value="Rectangle">Rectangle</option>
            <option value="Triangle">Triangle</option>
            <option value="Ellipse">Ellipse</option>
          </select>
        </label>
        <button id="add">Add</button>
        <button id="undo" disabled>Undo</button>
        <button id="redo" disabled>Redo</button>
        <button id="data">Show JSON</button>
        <div>For start a connection start a drag from any shape while ALT key is pressed.</div>
      </div>
      <div id="diagram"></div>
    </body>
</html>
```
## Documentation
Documentation will be added in future updates.
## License
© Daniel Canedo Ramos

Licensed under the [MIT License](LICENSE).
