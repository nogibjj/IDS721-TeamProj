import Head from "next/head";
import { useState } from "react";

import styles from "../styles/Home.module.css";

import axios from "axios";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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
          <button onClick={getImages}>Get Images</button>
        </p>
        <small>
          Picture Ratio:{" "}
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
          Click the image below and save.
        </small>
        <br />
        {error ? (<div className={styles.error}>Something went wrong. Try again.</div>) : (<></>)}
        {loading && <p>Loading...</p>}
        <div className={styles.grid}>
          {results.map((result) => {
            return (
              <div className={styles.card}>
                <img
                  className={styles.imgPreview}
                  src={result.url}
                  onClick={() => download(result.url)}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
