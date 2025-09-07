import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const PixiCanvas = ({ 
  width = 400, 
  height = 300, 
  animationType = 'default',
  production = 0,
  selectedPartData = null 
}) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PIXI application
    const app = new PIXI.Application({
      width: width,
      height: height,
      backgroundColor: 0x000000,
      backgroundAlpha: 0, // Transparent background
      antialias: true,
    });

    canvasRef.current.appendChild(app.view);
    appRef.current = app;

    // Create animations based on type
    switch (animationType) {
      case 'worker-lifting':
        createWorkerLiftingAnimation(app, production);
        break;
      case 'worker-straining':
        createWorkerStrainingAnimation(app, production, selectedPartData);
        break;
      case 'cash-stacking':
        createCashStackingAnimation(app, production, selectedPartData);
        break;
      case 'cash-comparison':
        createCashComparisonAnimation(app, production, selectedPartData);
        break;
      default:
        createDefaultAnimation(app);
    }

    // Cleanup function
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height, animationType, production, selectedPartData]);

  return <div ref={canvasRef} className="w-full h-full" />;
};

// Section 1: Worker lifting a box
const createWorkerLiftingAnimation = (app, production) => {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  // Simple worker (rectangle)
  const worker = new PIXI.Graphics();
  worker.beginFill(0x4A90E2);
  worker.drawRect(0, 0, 40, 60);
  worker.endFill();
  worker.x = 50;
  worker.y = 100;
  container.addChild(worker);

  // Box being lifted (square)
  const box = new PIXI.Graphics();
  box.beginFill(0x8B4513);
  box.drawRect(0, 0, 30, 30);
  box.endFill();
  box.x = 100;
  box.y = 120;
  container.addChild(box);

  // Animation: lifting motion
  const liftAnimation = () => {
    const time = Date.now() * 0.002;
    box.y = 120 + Math.sin(time) * 20;
    worker.y = 100 + Math.sin(time) * 5;
  };

  app.ticker.add(liftAnimation);
};

// Section 2: Worker straining under weight
const createWorkerStrainingAnimation = (app, production, selectedPartData) => {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  // Worker
  const worker = new PIXI.Graphics();
  worker.beginFill(0x4A90E2);
  worker.drawRect(0, 0, 40, 60);
  worker.endFill();
  worker.x = 50;
  worker.y = 100;
  container.addChild(worker);

  // Large weight (circle)
  const weight = new PIXI.Graphics();
  const weightSize = Math.min(80, 30 + (production / 1000) * 20); // Size based on production
  weight.beginFill(0x666666);
  weight.drawCircle(0, 0, weightSize);
  weight.endFill();
  weight.x = 150;
  weight.y = 100;
  container.addChild(weight);

  // Animation: straining motion
  const strainAnimation = () => {
    const time = Date.now() * 0.001;
    worker.y = 100 + Math.sin(time * 2) * 3; // Shaking
    weight.y = 100 + Math.sin(time) * 5;
  };

  app.ticker.add(strainAnimation);
};

// Section 3: Cash stacking up
const createCashStackingAnimation = (app, production, selectedPartData) => {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  const cashStacks = [];
  const stackCount = Math.min(10, Math.floor(production / 1000) + 3);

  // Create multiple cash stacks
  for (let i = 0; i < stackCount; i++) {
    const stack = new PIXI.Graphics();
    stack.beginFill(0x228B22);
    stack.drawRect(0, 0, 20, 30);
    stack.endFill();
    stack.x = 50 + (i * 25);
    stack.y = 200;
    container.addChild(stack);
    cashStacks.push(stack);
  }

  // Animation: stacking motion
  const stackAnimation = () => {
    const time = Date.now() * 0.001;
    cashStacks.forEach((stack, index) => {
      stack.y = 200 + Math.sin(time + index * 0.5) * 10;
    });
  };

  app.ticker.add(stackAnimation);
};

// Section 4: Small vs giant cash comparison
const createCashComparisonAnimation = (app, production, selectedPartData) => {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  // Small stack (worker's wage)
  const smallStack = new PIXI.Graphics();
  smallStack.beginFill(0x228B22);
  smallStack.drawRect(0, 0, 30, 40);
  smallStack.endFill();
  smallStack.x = 50;
  smallStack.y = 150;
  container.addChild(smallStack);

  // Giant stack (company profit)
  const giantStack = new PIXI.Graphics();
  const stackHeight = Math.min(120, 60 + (production / 1000) * 30);
  giantStack.beginFill(0x006400);
  giantStack.drawRect(0, 0, 60, stackHeight);
  giantStack.endFill();
  giantStack.x = 200;
  giantStack.y = 200 - stackHeight;
  container.addChild(giantStack);

  // Animation: comparison motion
  const comparisonAnimation = () => {
    const time = Date.now() * 0.001;
    smallStack.y = 150 + Math.sin(time) * 5;
    giantStack.y = (200 - stackHeight) + Math.sin(time * 0.5) * 3;
  };

  app.ticker.add(comparisonAnimation);
};

// Default animation (fallback)
const createDefaultAnimation = (app) => {
  const container = new PIXI.Container();
  app.stage.addChild(container);

  const circle = new PIXI.Graphics();
  circle.beginFill(0x4A90E2);
  circle.drawCircle(0, 0, 30);
  circle.endFill();
  circle.x = 100;
  circle.y = 100;
  container.addChild(circle);

  const defaultAnimation = () => {
    const time = Date.now() * 0.002;
    circle.x = 100 + Math.sin(time) * 20;
    circle.y = 100 + Math.cos(time) * 20;
  };

  app.ticker.add(defaultAnimation);
};

export default PixiCanvas;
