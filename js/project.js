(function () {
  const details = {
    "mathematical-model": {
      overview: "Replace this overview with a clear explanation of what you investigated, the question you answered and who might find the result useful.",
      motivation: "Describe the original observation or problem that prompted the project. Explain why the question mattered to you.",
      planning: "Record the assumptions, data sources, mathematical tools and stages of analysis you considered before beginning.",
      development: "Explain how you represented the system, tested its behaviour and refined the model. This is an example structure-replace it with your own process.",
      tools: ["Mathematics chosen for the model", "A spreadsheet or analysis tool", "Visualisation software"],
      challenges: "Add the strongest technical or conceptual difficulty you encountered and show what you changed to move past it.",
      results: "Present verified outcomes, diagrams or demonstrations here. Do not include a result until you can support it with evidence.",
      lessons: "Reflect on what the project taught you, what you would improve and a concrete next question you would explore.",
      github: "#"
    },
    "physics-experiment": {
      overview: "Replace this overview with the scientific question, the method used and the purpose of the investigation.",
      motivation: "Explain what sparked the experiment and which physical principle or uncertainty you hoped to investigate.",
      planning: "List the variables, apparatus, calibration steps and proposed method for collecting reliable measurements.",
      development: "Describe how you built or adapted the setup, ran trials and responded to anomalies or systematic effects.",
      tools: ["Experimental apparatus", "Measurement and data tools", "Analysis software"],
      challenges: "Explain a genuine difficulty such as uncertainty, measurement limitations or control of variables, and how you addressed it.",
      results: "Summarise only the evidence you obtained. Link to a graph, table or demonstration once available.",
      lessons: "Discuss the limits of your conclusion and identify a specific improvement or follow-up experiment.",
      github: "#"
    },
    "computing-tool": {
      overview: "Replace this with the problem your application solves, your intended users and the state of the finished tool.",
      motivation: "Describe the unmet need or personal question that led you to build software.",
      planning: "Explain the requirements, constraints, interface decisions and technical structure you planned before implementation.",
      development: "Walk through the implementation: core logic, interface, testing and the iterations that improved the result.",
      tools: ["Programming language", "Development tools", "Testing approach"],
      challenges: "Write about a real implementation, debugging or design problem and the reasoning that led to your solution.",
      results: "Show working features or a demonstration. Include honest limits and evidence of testing.",
      lessons: "Explain what you learned about engineering or product design and what you would change next.",
      github: "#"
    }
  };

  const parts = location.pathname.replace(/\/+$/, "").split("/");
  const slug = parts[parts.length - 1];
  const project = window.PORTFOLIO_DATA.projects.find(item => item.slug === slug);
  const detail = details[slug];
  const article = document.getElementById("project-article");
  if (!project || !detail) {
    article.innerHTML = '<header class="project-hero"><p class="project-kicker">Project unavailable</p><h1>Project not found.</h1></header><section class="article-section"><h2>Error</h2><p>This project could not be matched to <code>js/data.js</code>. <a href="../../index.html#projects">Return to projects.</a></p></section>';
    return;
  }
  document.title = `${project.title} - Joshua Ferreira`;
  article.innerHTML = `
    <header class="project-hero">
      <p class="project-kicker">${project.category} / ${project.date}</p>
      <h1>${project.title}</h1>
      <div class="project-hero-meta"><span>Academic project</span><span>Independent work</span><span>${project.date}</span></div>
    </header>
    <figure class="project-cover">
      <img src="../../${project.cover}" alt="${project.title} - replaceable project cover" width="1200" height="800">
      <figcaption><span>Cover / ${project.title}</span><span>Replaceable example image</span></figcaption>
    </figure>
    ${section("Overview", detail.overview)}
    ${section("Motivation and original idea", detail.motivation)}
    ${section("Research and planning", detail.planning)}
    ${section("Development process", detail.development)}
    ${section("Technologies and tools", `<ul>${detail.tools.map(tool => `<li>${tool}</li>`).join("")}</ul>`)}
    ${section("Challenges encountered", detail.challenges)}
    ${section("Results and demonstrations", detail.results)}
    ${section("Lessons learned and improvements", detail.lessons)}
    <section class="article-section"><h2>Project links</h2><div><p>[Insert links to materials that provide evidence of this project]</p><div class="project-links"><a href="${detail.github}">GitHub / external link</a><a href="../../index.html#projects">Back to projects</a></div></div></section>`;

  function section(title, content) {
    return `<section class="article-section"><h2>${title}</h2><div>${content}</div></section>`;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    article.animate([{opacity:0, transform:"translateY(18px)"},{opacity:1, transform:"none"}], {duration:700, easing:"cubic-bezier(.2,.7,.2,1)"});
  }
})();
