import styles from "../styles/Home.module.css";
import Image from "next/image";

export default function Home() {
    return (
        <main>
            <div className={styles.container}>
                <div className={styles.bio}>
                    <p>
                        I'm a final year undergraduate at Maharaja Surajmal Institute, Delhi. I
                        got introduced to programming when I was 14 years old and have been
                        fascinated by it, ever since. Always eager to learn and work with new
                        technologies to provide meaningful and performant solutions.
                    </p>
                </div>
                <div>
                    Here's my
                    <a href="/Lakshya-Kumar-Resume.pdf" target="_blank" rel="noopener noreferrer">
                        {" "}
                        Resume
                    </a>
                    .
                </div>
            </div>
        </main>
    );
}
