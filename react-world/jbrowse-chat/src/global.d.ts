// // // src/global.d.ts

// // Extend the Window interface to include the Aioli property
// interface Window {
//     Aioli: () => any;
//   }
  
// // src/global.d.ts

// interface AioliInstance {
//     exec: (command: string) => Promise<string>;
//     mount: (files: { name: string; url: string }[]) => Promise<void>;
//   }
  
//   interface AioliConstructor {
//     new (tools: string[]): AioliInstance;
//   }
  
//   interface Window {
//     Aioli: AioliConstructor;
//   }
  

interface AioliConstructor {
  new (tools: string[]): AioliInstance;
}

interface Window {
  Aioli: AioliConstructor;
}