import React from "react";

import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div>
          <img className={styles.profile_image} src="Casual-photo.jpg" />
        </div>
        <div>
          <h1 className="title_large">Hey there!</h1>
          <p className="description">
            I'm a Software Engineer. I got introduced to programming when I was
            16 years old and have been fascinated by it, ever since.
            <br />
            Always eager to learn and work with new technologies to provide
            meaningful and performant solutions.
          </p>
          <p className="description">You can find me online at:</p>
          <ul>
            <li>
              <a
                href="https://www.linkedin.com/in/lakshyakumar27/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/27lakshay"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>
            </li>
            <li>
              <a
                href="https://x.com/luxwashere"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter/X
              </a>
            </li>
            <li>
              <a
                href="/resume.pdf/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.wrapper}>
        <p className="description">
          I have expertise in: Javascript, Typescript, React.js, HTML/CSS, Data
          Structures & Algorithms
        </p>
      </div>
      <div className={styles.wrapper}>
        <div>
          <p className="description">
            Currently I'm looking for full-time opportunities in frontend space.
          </p>
          <p className="description">I've previously worked with:</p>
          <ul>
            <li>
              <a
                href="https://getmerlin.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Merlin AI
              </a>
              <span className="description"> - AI Chat & Integrations </span>
            </li>
            <li>
              <a
                href="https://groww.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Groww
              </a>
              <span className="description"> - Investment platform </span>
            </li>
            <li>
              <a
                href="https://www.scoopwhoop.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ScoopWhoop
              </a>
              <span className="description"> - Internet media publisher</span>
            </li>
            <li>
              <a
                href="https://www.unscripted.news/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Unscripted
              </a>
              <span className="description"> - Video streaming platform</span>
            </li>
            <li>
              <a
                href="https://saycheese.life/"
                target="_blank"
                rel="noopener noreferrer"
              >
                SayCheese
              </a>
              <span className="description"> - Wellness coaching services</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
