import Head from "next/head";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { useState, useRef, useEffect } from "react";

import styles from "../styles/Home.module.css";

import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(true);

  const [dragWidth, setDragWidth] = useState(50);
  const [dragHeight, setDragHeight] = useState(50);

  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      console.log('Element:', elementRef.current);
      console.log('Element position:', elementRef.current.getBoundingClientRect());
    }
  }, []);

  function getImages() {
    if (prompt != "") {
      setError(false);
      setLoading(true);
      axios
        .post(`/api/images?p=${prompt}`)
        .then((res) => {
          setResults(res.data.result);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setError(true);
        });
    } else {
      setError(true);
    }
  }

  const [type, setType] = useState("landscape");

  function download(url) {
    axios
      .post(`/api/download`, { url: url, type: type })
      .then((res) => {
        const link = document.createElement("a");
        link.href = res.data.result;
        link.download = `${prompt}.${type.toLowerCase()}`;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function edit() {
    setEditing(true);
    setError(false);
    setLoading(false);
  }

  function handleResize(e, data, handle) {
    const { x, y } = data;
    const img = e.target.parentElement.previousSibling;
    const parent = e.target.parentElement.parentElement;
    let newWidth = img.width;
    let newHeight = img.height;

    switch (handle) {
      case "tl":
        newWidth -= x;
        newHeight -= y;
        break;
      case "tr":
        newWidth += x;
        newHeight -= y;
        break;
      case "bl":
        newWidth -= x;
        newHeight += y;
        break;
      case "br":
        newWidth += x;
        newHeight += y;
        break;
    }

    // Set the minimum width and height
    newWidth = Math.max(newWidth, 50);
    newHeight = Math.max(newHeight, 50);

    img.style.width = newWidth + "px";
    img.style.height = newHeight + "px";
    parent.style.width = newWidth + "px";
    parent.style.height = newHeight + "px";
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>IDS721: GPT DALLE App</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Create images with <span className={styles.titleColor}>DALLE</span>
        </h1>
        <p className={styles.description}>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt"
          />
          {"  "}
          {results.length == 0 ? (
            <button onClick={edit}>Edit</button>
          ) : (
            <button onClick={getImages}>Get Images</button>
          )}
        </p >
        <small>
          Picture Ratio:&nbsp;{" "}
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="landscape">16:9 Landscape</option>
            <option value="normal">4:3 Normal</option>
            <option value="classic">3:2 Classic</option>
            <option value="square">1:1 Square</option>
            <option value="protrait">3:4 Protrait</option>
          </select>
          {" "}
        </small>
        <br />
        {error ? (<div className={styles.error}>Something went wrong. Try again.</div>) : (<></>)}
        {loading && (<div className={styles.loading}>Loading...</div>)}
        <div className={styles.grid}>
          {/* {results.map((result) => { */}
          {/* return ( */}
          <div className={styles.card}>

            <img ref={elementRef} className={styles.imgPreview} src="https://hips.hearstapps.com/hmg-prod/images/little-cute-maltipoo-puppy-royalty-free-image-1652926025.jpg?crop=0.444xw:1.00xh;0.129xw,0&resize=980:*" />
            {editing && (
              <>
                <Draggable
                  onDrag={(e, data) => {
                      console.log('Element position:', data);
                      console.log('e: ', e.clientY);
                  }}
                >
                  <Resizable
                    defaultSize={{width: dragWidth, height: dragHeight}}         
                    style={{backgroundColor: "red", display: "flex", position: "absolute", marginTop: "-100px"}}
                  >
                      Drag me!
                  </Resizable>
            
                </Draggable>
              </>
            )}

          </div>
          {/* ); */}
          {/* })} */}
        </div>
      </main>
    </div>
  );
}