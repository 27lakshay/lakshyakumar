import React from "react";

const DATA = {
  name: "Hey! I'm Lakshya",
  subtext: "Developer based in Delhi, India",
  jobStatus: "SDE Intern @Groww | Open to full-time roles",
  twitterURL: "https://twitter.com/lakshay983",
  instaURL: "https://www.instagram.com/lakshay_ya/",
  githubURL: "https://github.com/27lakshay",
  linkedinURL: "https://www.linkedin.com/in/lakshyakumar27",
  resumeURL: "/resume.pdf",
};

const Resume = () => {
  return (
    <div className="wrapper">
      <div className="left">
        <div className="bg-img"></div>
        <div className="left-inner">
          <div className="info">
            <h2 className="name">{DATA.name}</h2>
            <div className="subtext">{DATA.subtext}</div>
            <div className="jobStatus">{DATA.jobStatus}</div>
            <div className="social-links">
              <a href={DATA.twitterURL} target="_blank">
                <i className="fa fa-twitter"></i>
              </a>
              <a href={DATA.instaURL} target="_blank">
                <i className="fa fa-instagram"></i>
              </a>
              <a href={DATA.githubURL} target="_blank">
                <i className="fa fa-github"></i>
              </a>
              <a href={DATA.linkedinURL} target="_blank">
                <i className="fa fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="right">
        <div className="right-inner">
          <div className="introduction">
            <h4>Career Objectives</h4>
            <div className="content">
              {/* <p className="intro-p">
                I&#39;m a recent graduate of Bachelors in Computer Applications.
              </p> */}
              <p className="intro-p">
                I enjoy being the bridge between engineering and design, and
                feel right at home as a front end engineer. I hold hands-on
                experience in developing and designing products for the web with
                internships from well-established companies to budding start
                ups.
              </p>
              <span className="intro-p job-pls">
                I aspire to utilize my skill-set and continue learning as a part
                of your team.
              </span>
            </div>
          </div>
          <div className="skills">
            <h4>Technical Skills</h4>
            <div className="content">
              <div className="skill-category">
                <strong>Languages: &nbsp;</strong>
                <span>
                  JavaScript (ES6), TypeScript, HTML5, CSS3, Sass, Java, Python
                </span>
              </div>
              <div className="skill-category">
                <strong>Libraries &amp; Frameworks: &nbsp;</strong>
                <span>
                  React, Next, Vue, Redux, Node.js Express, Tailwind, BootStrap
                </span>
              </div>
              <div className="skill-category">
                <strong>Tools: &nbsp;</strong>
                <span>
                  Git &amp; Github, Gulp, Webpack, Netlify, Heroku, AWS EC2,
                  Docker, Firebase, Figma, Adobe Illustrator, Rhino 3D
                </span>
              </div>
            </div>
          </div>
          <div className="education">
            <h4>Education</h4>
            <div className="content">
              <div className="university">
                <a>GGSIP University</a>
              </div>
              <div className="college">
                <a>Maharaja Surajmal Institute</a>
              </div>
              <div className="major">Bachelor of Computer Applications</div>
              <div className="minor">Data Structures &amp; Algorithms</div>
              <div className="conc">Web Development</div>
              <div className="conc">2019 - 2022</div>
              {/* <div className="grad-date"></div> */}
            </div>
          </div>
          <div className="experience">
            <h4>Work Experience</h4>
            <div className="content">
              <div className="exp-item">
                <div className="job">
                  <a
                    className="company"
                    href="https://groww.in/"
                    target="_blank"
                  >
                    Groww
                  </a>
                  <div className="duration">Jan &mdash; July 2022</div>
                </div>
                <div className="title">SDE Intern</div>
                <ul className="description">
                  <li>
                    Collaborated with onboarding team to build a dynamic
                    onboarding system driven by APIs
                  </li>
                  <li>
                    Worked closely with designers and product team to develop
                    and document KYC flow, resulting in increase of customer
                    conversion rate by 5%
                  </li>
                  <li>
                    Developed and shipped responsive multi-step wizards to
                    capture user details
                  </li>
                </ul>
              </div>
              <div className="exp-item">
                <div className="job">
                  <a
                    className="company"
                    href="https://scoopwhoop.com/"
                    target="_blank"
                  >
                    ScoopWhoop Media
                  </a>
                  <div className="duration">July &mdash; Dec 2021</div>
                </div>
                <div className="title">Frontend Developer Intern</div>
                <ul className="description">
                  <li>
                    Collaborated with designers for migration of scoopwhoop.com
                    from jinja templating to NextJS and leveraged
                    AMP(Accelerated Mobile Pages) for content pages
                  </li>
                  <li>
                    Engineered, maintained and documented autosave feature for
                    CMS using Vue.js and lodash significantly improving Content
                    Writers user experience
                  </li>
                  <li>
                    Added video player features to unscripted.news similar to
                    that of YouTube's
                  </li>
                  <li>
                    Built an internal package on top of video.js library for
                    customizable video player features
                  </li>
                </ul>
              </div>
              <div className="exp-item">
                <div className="job">
                  <a
                    className="company"
                    href="https://www.linkedin.com/company/vps-techub-pvt-ltd/"
                    target="_blank"
                  >
                    VPS Techub
                  </a>
                  <div className="duration">March &mdash; June 2021</div>
                </div>
                <div className="title">React Developer Intern</div>
                <ul className="description">
                  <li>
                    Worked on a women-wellness centric website, to help women
                    with their personal and professional life by providing them
                    coaching and therapy sessions modules
                  </li>
                  <li>
                    Developed and maintained the website's core feature,
                    self-learning modules with 100+ screens multi-wizard having
                    quizzes and animations
                  </li>
                  <li>
                    Incorporated Redux for global state management and a Cart
                    System
                  </li>
                  <li>
                    Interfaced with clients on a weekly basis, providing
                    technological expertise and knowledge
                  </li>
                  <li>
                    Developed and shipped highly interactive web application for
                    client using Next.js
                  </li>
                </ul>
              </div>
              <div className="exp-item">
                <div className="job">
                  <a
                    className="company"
                    href="https://www.linkedin.com/company/lscg/"
                    target="_blank"
                  >
                    LS&amp;CG
                  </a>
                  <div className="duration">Sept 2020 &mdash; Jan 2021</div>
                </div>
                <div className="title">Full Stack Developer Consultant</div>
                <ul className="description">
                  <li>
                    Developed an API for internal employee management system
                    using Express &amp; Node.js
                  </li>
                  <li>
                    Built Dashboard for the user to edit and overview details
                    with React & used Storybook for development and testing of
                    reusable components
                  </li>
                  <li>Implemented authentication using OAuth 2.0</li>
                  <li>
                    Collaborated with designers and management on a weekly basis
                    to oversee succesful product launch
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* <div className="projects">
            <h4>Projects</h4>
            <div className="content">
              <div className="project-item">
                <a
                  className="project-title"
                  href="http://brittanychiang.com/"
                  target="_blank"
                >
                  brittanychiang.com
                </a>
                <p className="project-desc">
                  Portfolio site designed and coded from scratch to showcase my
                  skills and past work
                </p>
              </div>
              <div className="project-item">
                <div className="project-title">CourseSource</div>
                <p className="project-desc">
                  Web app built on the MEAN (MongoDB, Express, Angular, Node)
                  stack for my web development class. Created with the intention
                  of providing students a better experience browsing the courses
                  offered at Northeastern
                </p>
              </div>
              <div className="project-item">
                <a
                  className="project-title"
                  href="http://nuwit.ccs.neu.edu/"
                  target="_blank"
                >
                  NU Women in Tech
                </a>
                <p className="project-desc">
                  Club website redesigned and redeveloped as while serving as
                  web chair on e-board
                </p>
              </div>
              <div className="project-item">
                <a
                  className="project-title"
                  href="http://onecardforall.mullenloweus.com/"
                  target="_blank"
                >
                  One Card For All
                </a>
                <p className="project-desc">
                  2015 Mullen Lowe U.S. holiday site built around an algorithm
                  that generated a holiday greeting to each and every person on
                  the planet
                </p>
              </div>
            </div>
          </div> */}
          <a className="resume" href={DATA.resumeURL} target="_blank">
            <div className="resume-link">Grab a PDF of my full resume</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Resume;
