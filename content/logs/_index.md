---
title: "Logs"
---

{{< rawhtml >}}
<div class="log-page" data-reveal-stagger data-reveal-start="190" data-reveal-step="75">
  <aside class="log-sidebar" aria-label="Log entries" data-scrollspy data-reveal>
    <p><strong>Week 1</strong></p>
    <ul>
      <li><a href="#monday-july-6th">Monday July 6th</a>
        <ul>
          <li><a href="#collaboration">Collaboration</a></li>
        </ul>
      </li>
      <li><a href="#tuesday-july-7th">Tuesday July 7th</a>
        <ul>
          <li><a href="#building-the-project-page">Building the Project Page</a></li>
        </ul>
      </li>
      <li><a href="#wednesday-july-8th">Wednesday July 8th</a>
        <ul>
          <li><a href="#polishing-details">Polishing Details</a></li>
        </ul>
      </li>
      <li><a href="#thursday-july-9th">Thursday July 9th</a>
        <ul>
          <li><a href="#wiring-things-together">Wiring Things Together</a></li>
        </ul>
      </li>
      <li><a href="#friday-july-10th">Friday July 10th</a>
        <ul>
          <li><a href="#nine-datasets-and-a-quiz">Nine Datasets and a Quiz</a></li>
        </ul>
      </li>
    </ul>
    <p><strong>Week 2</strong></p>
    <ul>
      <li><a href="#monday-july-13th">Monday July 13th</a>
        <ul>
          <li><a href="#learning-to-predict">Learning to Predict</a></li>
        </ul>
      </li>
      <li><a href="#tuesday-july-14th">Tuesday July 14th</a>
        <ul>
          <li><a href="#trees-clusters-and-california">Trees, Clusters, and California</a></li>
        </ul>
      </li>
      <li><a href="#wednesday-july-15th">Wednesday July 15th</a>
        <ul>
          <li><a href="#dimensions-validation-and-baseball">Dimensions, Validation, and Baseball</a></li>
        </ul>
      </li>
      <li><a href="#thursday-july-16th">Thursday July 16th</a>
        <ul>
          <li><a href="#a-day-at-cal-academy">A Day at Cal Academy</a></li>
        </ul>
      </li>
    </ul>
  </aside>

  <div class="log-main">
    <div class="log-search" data-reveal>
      <label class="sr-only" for="logSearch">Search logs</label>
      <input id="logSearch" type="search" placeholder="Search logs" autocomplete="off" />
    </div>

    <div id="logEmpty" class="log-empty" role="status">No matching log entries found.</div>

    <div class="log-week-break" aria-label="Week 1" data-reveal><span>Week 1</span></div>

    <section class="log-card" id="monday-july-6th" data-reveal>
      <h2>Monday July 6th</h2>
      <h3 id="collaboration">Collaboration</h3>
      <p>We randomized into our groups and got this website to work with for the rest of the program. We set up Github, Codex, VS Code, and worked together to not destroy the "main" branch of our website. Wonjun was amazing and really nice, helping everyone out and explaining everything to us. This'll be our place to share what our life is like in Cluster 11.</p>
    </section>

    <section class="log-card" id="tuesday-july-7th" data-reveal>
      <h2>Tuesday July 7th</h2>
      <h3 id="building-the-project-page">Building the Project Page</h3>
      <p>Today we started filling in our Project page. We ran our first mini project: a survey on how much sleep students got versus how refreshed they felt, with the data pulled straight from a Google Form as an example of data acquisition. Pranav put together the two boxplots and got them showing up on the site, and we linked in our separate analysis repo so people can dig into the code. We also spent some time wrestling with the layout, cleaning up the spacing between columns so everything lined up right.</p>
    </section>

    <section class="log-card" id="wednesday-july-8th" data-reveal>
      <h2>Wednesday July 8th</h2>
      <h3 id="polishing-details">Polishing Details</h3>
      <p>Shorter day of tweaks. Advay went back through the project description and cleaned up the wording so it reads better, including relabeling the survey section and fixing "data extraction" to "data acquisition" so it matches what we actually did.</p>
    </section>

    <section class="log-card" id="thursday-july-9th" data-reveal>
      <h2>Thursday July 9th</h2>
      <h3 id="wiring-things-together">Wiring Things Together</h3>
      <p>Brendan added a second GitHub icon to the site config so our analysis repo is linked right next to the main one. We also went back and wrote up the log for Monday to get our logs tab caught up, then filled in the rest of the week so this page tells the whole story of what we've been up to.</p>
    </section>

    <section class="log-card" id="friday-july-10th" data-reveal>
      <h2>Friday July 10th</h2>
      <h3 id="nine-datasets-and-a-quiz">Nine Datasets and a Quiz</h3>
      <p>Today's lecture walked us through the nine candidate datasets we could build our COSMOS project around, going from real-world data to a research question for each. The lineup: Sienna scalp EEG (clinical time-series of epilepsy recordings in EDF files), Dreyer2023 BCI (prompt-based motor imagery EEG for brain-computer interfaces), PBMC3K (single-cell RNA-seq counts from blood immune cells as a sparse gene-by-cell matrix), Bay Wheels San Francisco (trip-level bike share records and station mobility summaries), California SWE (daily snow water equivalent by station and date), Copenhagen Networks (a multi-layer network of Bluetooth proximity, calls, SMS, and Facebook), Email-Eu-Core Temporal (directed email events in a research institution), SocioPatterns High School (face-to-face proximity contacts between students), and StatsBomb 2022 World Cup (football event streams with 360 freeze-frame context). For each one we learned how to read the data, the key terms, and the kinds of research questions it could answer. We also took a quick quiz covering everything from the previous days to check what stuck.</p>
    </section>

    <div class="log-week-break log-week-break--continued" aria-label="Week 2" data-reveal><span>Week 2</span></div>

    <section class="log-card" id="monday-july-13th" data-reveal>
      <h2>Monday July 13th</h2>
      <h3 id="learning-to-predict">Learning to Predict</h3>
      <p>Today we started prediction and supervised learning, where a model learns a mapping from input features to a labeled output. We compared regression for continuous values with classification for categories, then discussed how training, validation, and test sets help us fit models and evaluate their performance on unseen data. We also looked at common loss functions, including mean squared and absolute error for regression and 0-1 and cross-entropy loss for classification. A major focus was the bias-variance tradeoff: simple models tend to have higher bias and lower variance, while more complex models can have lower bias but higher variance. We surveyed methods ranging from linear, polynomial, ridge, lasso, and elastic-net regression to k-NN, splines, decision trees, random forests, boosting, PCR, PLS, stacking, and bagging. We finished by giving our group presentation on the CDC data analysis project.</p>
    </section>

    <section class="log-card" id="tuesday-july-14th" data-reveal>
      <h2>Tuesday July 14th</h2>
      <h3 id="trees-clusters-and-california">Trees, Clusters, and California</h3>
      <p>Today's lecture continued prediction with classification, decision trees, and ensemble learning. We learned how CART recursively splits the feature space, then compared boosting, bagging, and random forests and how they reduce bias or variance. We also discussed Leo Breiman's <a href="https://www2.math.uu.se/~thulin/mm/breiman.pdf">two cultures of statistical modeling</a> before moving into unsupervised learning. We compared hierarchical clustering with K-means, explored several ways to measure similarity and distance, and learned how elbow and silhouette methods can help choose the number of clusters. In lab, we worked through the mathematics behind linear regression. We then began Mini Project 2, using longitude, latitude, and median house value from the California Housing dataset to build and interpret a map of geographically connected, price-similar regions with K-means.</p>
    </section>

    <section class="log-card" id="wednesday-july-15th" data-reveal>
      <h2>Wednesday July 15th</h2>
      <h3 id="dimensions-validation-and-baseball">Dimensions, Validation, and Baseball</h3>
      <p>Today we learned how dimension-reduction methods such as PCA and t-SNE transform high-dimensional data into fewer dimensions for exploration, downstream analysis, and finding hidden patterns. We then focused on model validation through new data, train-test splits, cross-validation, and residual analysis. This tied back to the bias-variance tradeoff: more flexible models can capture complicated relationships, but too much complexity causes them to learn noise instead, so criteria such as AIC and BIC penalize complexity. We also compared evaluation metrics for different tasks, including MSE, R², accuracy, precision, recall, AUC-ROC, inertia, silhouette score, and explained variance. We finished with a distinguished guest lecture from Dr. David Gagnon, the Washington Nationals' baseball science team lead, who showed how statistical modeling, computer vision, and mechanics are used to measure bat paths and player movement in real games.</p>
    </section>

    <section class="log-card" id="thursday-july-16th" data-reveal>
      <h2>Thursday July 16th</h2>
      <h3 id="a-day-at-cal-academy">A Day at Cal Academy</h3>
      <p>Today our whole cluster took a field trip to San Francisco to explore the California Academy of Sciences. We traded the classroom for a day of walking through the museum's many attractions, from the aquarium and its incredible marine life to the towering indoor rainforest filled with plants, birds, butterflies, and other animals. It was a fun chance to experience science outside of lectures, explore together, and spend time with the rest of the cluster.</p>
    </section>

  </div>
</div>

<script>
  const searchInput = document.getElementById('logSearch');
  const emptyState = document.getElementById('logEmpty');
  const cards = Array.from(document.querySelectorAll('.log-card'));

  function filterLogs() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(query);
      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount += 1;
    });

    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', filterLogs);
</script>

{{< /rawhtml >}}
