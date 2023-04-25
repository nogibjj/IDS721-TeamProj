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
  const [editing, setEditing] = useState(false);
  const [topLeftX, setTopLeftX] = useState(0);
  const [topLeftY, setTopLeftY] = useState(0);

  const [boxWidth, setBoxWidth] = useState(100);
  const [boxHeight, setBoxHeight] = useState(100);

  const [topRightX, setTopRightX] = useState(0);
  const [topRightY, setTopRightY] = useState(0);
  const [bottomLeftX, setBottomLeftX] = useState(0);
  const [bottomLeftY, setBottomLeftY] = useState(0);
  const [bottomRightX, setBottomRightX] = useState(0);
  const [bottomRightY, setBottomRightY] = useState(0);

  useEffect(() => {
    setTopRightX(topLeftX + boxWidth);
    setTopRightY(topLeftY);
    setBottomLeftX(topLeftX);
    setBottomLeftY(topLeftY + boxHeight);
    setBottomRightX(topLeftX + boxWidth);
    setBottomRightY(topLeftY + boxHeight);

    console.log("Box Width, Height:", boxWidth, boxHeight);
    console.log("Top Left(X,Y):", topLeftX, topLeftY);
    console.log("Top Right(X,Y):", topRightX, topRightY);
    console.log("Bottom Left(X,Y):", bottomLeftX, bottomLeftY);
    console.log("Bottom Right(X,Y):", bottomRightX, bottomRightY);
  }, [topLeftX, topLeftY, boxWidth, boxHeight]);

  const elementRef = useRef(null);
  const textRef = useRef(null);

  function getImages() {
    if (prompt != "") {
      setError(false);
      setLoading(true);
      axios
        .post(`/api/images?p=${prompt}`, {type: type})
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

  const [type, setType] = useState("square");

  function edit() {
    setEditing(true);
    setError(false);
    setLoading(false);
  }

  function getModifiedImage() {
    if (results.length > 0 && prompt != "") {
      setError(false);
      setLoading(true);
      axios
        .post(
          // TODO: add the mask to the query string
          `/api/editImage?image=${results[0].url}&mask=${results[0].url}&p=${prompt}`
        )
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

  function cancel() {
    setEditing(false);
    setError(false);
    setResults([]);
  }

  function getButtons() {
    if (editing) {
      return (
        <>
          <button onClick={getModifiedImage}>Modify</button>
          <button onClick={cancel} style={{ marginLeft: "1rem" }}>Cancel</button>
        </>
      );
    } else {
      if (results.length > 0) {
        return <button onClick={edit}>Edit</button>;
      } else {
        return <button onClick={getImages}>Get Images</button>;
      }
    }
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
          {getButtons()}
        </p>
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
          </select>{" "}
        </small>
        <br />
        {error ? (
          <div className={styles.error}>Something went wrong. Try again.</div>
        ) : (
          <></>
        )}
        {loading && <div className={styles.loading}>Loading...</div>}
        <div className={styles.grid}>
          {results.map((result) => {
            return (
              <div className={styles.card}>
                <img
                  ref={elementRef}
                  className={styles.imgPreview}
                  src={result.url}
                />
                {editing && (
                  <>
                    <Draggable
                      onDrag={(e) => {
                        const imgRect =
                          elementRef.current.getBoundingClientRect();
                        const textRect =
                          textRef.current.getBoundingClientRect();
                        const relativeX = textRect.left - imgRect.left;
                        const relativeY = textRect.top - imgRect.top;
                        setTopLeftX(relativeX);
                        setTopLeftY(relativeY);
                      }}
                    >
                      <Resizable
                        defaultSize={{ width: boxWidth, height: boxHeight }}
                        onResizeStop={(e, direction, ref, d) => {
                          setBoxWidth(parseInt(ref.style.width, 10));
                          setBoxHeight(parseInt(ref.style.height), 10);
                        }}
                        style={{
                          display: "flex",
                          position: "absolute",
                          marginTop: "-100px",
                        }}
                      >
                        <div
                          ref={textRef}
                          style={{
                            border: "3px dashed red",
                            backgroundColor: "rgba(0, 0, 0, 0.17)",
                            padding: "5px",
                            boxSizing: "border-box",
                            width: "100%",
                            height: "100%",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "lightgreen",
                          }}
                        >
                          Draggable MASK!
                        </div>
                      </Resizable>
                    </Draggable>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
