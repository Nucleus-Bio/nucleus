import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { buffer } from 'stream/consumers';
import path from 'path';



function App() {

  // const fs = require('fs').promises;

  const [workspacePaths, setWorkspacePaths] = useState();

  

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const message = event.data;
      console.log("file in react", message);

      if (message.command === 'message') {
        console.log("file in react 2", message);
        setWorkspacePaths(message.data);
        // const blob = new Blob([message.data]);
        // console.log("blob in react", blob)
        
      }
    };

    window.addEventListener('message', handleMessage);

    console.log("workspacePaths",workspacePaths)
    return () => {
      // window.removeEventListener('message', handleMessage);
    };
  }, [workspacePaths]);

  

  const handleButtonClick = async () => {
    // Ensure the Aioli function is available on the window object
    if (window.Aioli) {

      console.log("clicked in react")
      const CLI = await new window.Aioli(["samtools/1.10"]); // Call the Aioli function

      
      if (workspacePaths) { // Check if workspacePaths is defined
        const blob = new Blob([workspacePaths]);
        console.log(blob)
      //   const paths = await CLI.mount([{
      //     name: "output.sam",
      //     data: blob
      // }]);
      const paths = await CLI.mount([
        { name: "output.sam", url: "https://file%2B.vscode-resource.vscode-cdn.net/Users/pratikkatte/Desktop/ex3.sam" },
    ]);
      
      console.log(paths)
      
      console.log(await CLI.pwd());
      console.log(await CLI.ls(await CLI.pwd()));

        const output = await CLI.exec("samtools view output.sam");
        console.log(output)
      } else {
        console.error("workspacePaths is undefined");
      }


      // const bamURL = "https://1000genomes.s3.amazonaws.com/phase3/data/NA12878/alignment/NA12878.chrom20.ILLUMINA.bwa.CEU.low_coverage.20121211.bam";
      // const baiURL = bamURL + ".bai";

      // // Mount a .bam and .bai from the 1000 Genomes Project. This mounts the URLs lazily
      // // on the virtual file system. In other words, no data is downloaded yet.
      // await CLI.mount([
      //     { name: "test.bam", url: bamURL },
      //     { name: "test.bam.bai", url: baiURL },
      // ]);

    // Since the .bai index file is present, samtools only downloads a subset of the .bam!
    // Check the "Network" tab in the developer console to confirm that.
      // const output = await CLI.exec("samtools view test.bam 20:39,352,829-39,352,842");



    } else {
      console.error("Aioli is not loaded");
    }
  };



  return (
    <div className="App">
      <h1>Workspace Paths</h1>
      {/* <ul>
        {workspacePaths.map((path, index) => (
          <li key={index}>{path}</li>
        ))}
      </ul> */}
        <div>
        <button onClick={handleButtonClick}>CLICK ME</button>
        </div>
      
    </div>
  );
}

export default App;