---
title: "K-Means Analysis of California Housing"
date: 2026-07-14
description: "Grouping California census block groups into geographic housing-market regions"
thumbnail: "k-means-california-housing.png"
thumbnailAlt: "Map of six California housing clusters beside boxplots of house values by cluster"
author: "Pattern Seekers"
hideMeta: true
---

We used **K-means clustering** to divide California census block groups into six housing-market regions based on location and median house value. The goal was to find groups whose observations were geographically close and had broadly similar prices without supplying the algorithm with predefined region labels.

## Data Structure

The analysis used scikit-learn's California Housing dataset, which was derived from the 1990 U.S. Census. It contains 20,640 rows, with one row representing one census block group. The complete dataset has eight explanatory variables and one target, but the final clustering model uses only three numeric features:

| Feature | Meaning | Unit in the dataset |
| --- | --- | --- |
| `Longitude` | East-west location of the block group | Decimal degrees |
| `Latitude` | North-south location of the block group | Decimal degrees |
| `MedHouseVal` | Median house value | Hundreds of thousands of dollars |

There are no missing values in these features. Although `MedHouseVal` is called a target in the original supervised-learning dataset, K-means treats it simply as a third input coordinate. K-means operates on a numeric matrix, so the model input has 20,640 rows and three columns. It does not use labels or a response variable.

## Purpose of K-Means

K-means is an **unsupervised clustering** method. Its purpose is to partition observations into \\(K\\) groups so that observations within the same group are as similar as possible under Euclidean distance. In this project, similarity combines geographic proximity and house value. The resulting clusters are descriptive market regions, not predictions or official geographic boundaries.

## Scaling and Feature Weighting

Euclidean distance is sensitive to measurement units. Longitude and latitude are measured in degrees, while `MedHouseVal` is measured in units of $100,000. Using the raw columns would let whichever feature has the largest numerical spread dominate the distance calculation, even if that dominance did not match the research goal.

The notebook therefore standardizes each feature with `StandardScaler`:

$$
z_{ij}=\frac{x_{ij}-\bar{x}_j}{s_j},
$$

where \\(x_{ij}\\) is feature \\(j\\) for observation \\(i\\), \\(\bar{x}_j\\) is that feature's mean, and \\(s_j\\) is its standard deviation. After this transformation, each feature is centered near zero and has unit variance.

The final notebook iteration then multiplies the standardized house-value feature by 0.35. Thus, the vector actually clustered is

$$
\mathbf{y}_i = \left(z_{i,\text{longitude}},\ z_{i,\text{latitude}},\ 0.35z_{i,\text{price}}\right).
$$

This weighting makes geographic position more influential while still allowing price to affect cluster membership. It is a modeling choice rather than a requirement of K-means, so its effect should be checked with sensitivity analysis.

## Minimization Problem

For observations \\(\mathbf{y}_1,\ldots,\mathbf{y}_n\\), K-means chooses a partition \\(C_1,\ldots,C_K\\) and a centroid \\(\boldsymbol{\mu}_k\\) for each cluster to minimize the within-cluster sum of squared distances:

$$
\underset{C_1,\ldots,C_K}{\operatorname{minimize}}
\quad
\sum_{k=1}^{K}\sum_{\mathbf{y}_i\in C_k}
\left\lVert \mathbf{y}_i-\boldsymbol{\mu}_k\right\rVert_2^2.
$$

The centroid \\(\boldsymbol{\mu}_k\\) is the mean of all transformed observations assigned to cluster \\(k\\). The minimized quantity is also called **inertia**. Lower inertia means points lie closer to their assigned centroids, but inertia always decreases as \\(K\\) increases and therefore cannot select \\(K\\) by itself.

## Algorithm

The notebook uses scikit-learn's `KMeans`, which applies an iterative procedure commonly called Lloyd's algorithm:

1. Initialize \\(K\\) centroids. The implementation uses its default K-means++ initialization, which spreads the starting centroids apart.
2. Assign every observation to the nearest centroid using squared Euclidean distance.
3. Recalculate each centroid as the mean of the observations assigned to it.
4. Repeat the assignment and update steps until the centroids stabilize or the stopping limit is reached.
5. Repeat the entire fit from 10 different initializations and retain the solution with the lowest inertia.

This procedure decreases the objective after each assignment-update cycle, but it is not guaranteed to find the global minimum. Multiple initializations reduce the chance of reporting a poor local solution.

## Hyperparameters

The final model uses the following settings:

| Hyperparameter or setting | Value | Reason |
| --- | --- | --- |
| Number of clusters, `n_clusters` | 6 | Produces a manageable set of regions that can be interpreted on a California map. |
| Number of initializations, `n_init` | 10 | Tries several starting configurations and keeps the one with the lowest inertia. |
| Initialization | K-means++ default | Gives more dispersed starting centroids than purely random initialization. |
| Random seed, `random_state` | 42 | Makes the fitted assignments reproducible. |
| Standardized price weight | 0.35 | Prioritizes geographic continuity while retaining price information. |
| Stopping tolerance and maximum iterations | scikit-learn defaults | The notebook does not override the library's convergence controls. |

The current analysis fixes \\(K=6\\) for interpretability; it does not compare candidate values of \\(K\\). A more systematic selection would fit a range of values and compare an elbow plot of inertia, silhouette scores, cluster stability across random seeds, and whether the resulting regions remain useful for the research question. The 0.35 price weight should be assessed in the same way because changing it changes the meaning of distance and therefore the clusters.

## Results

Reproducing the final notebook configuration produced the following summaries. Cluster numbers are identifiers only; their numeric order has no substantive meaning.

| Cluster | Observations | Mean house value | Approximate geographic centroid (longitude, latitude) |
| ---: | ---: | ---: | ---: |
| 0 | 2,062 | $162,767 | (-116.92, 33.06) |
| 1 | 4,051 | $291,133 | (-122.14, 37.59) |
| 2 | 6,799 | $177,452 | (-118.07, 34.02) |
| 3 | 2,345 | $400,190 | (-118.33, 33.96) |
| 4 | 1,725 | $101,702 | (-119.74, 36.19) |
| 5 | 3,658 | $118,677 | (-121.72, 38.71) |

<div class="project-figure"><img src="/26-the-pattern-seekers/k-means-california-housing.png" alt="Scatterplot map of six California housing clusters and boxplots showing their house-value distributions" style="width: 100%; height: auto;"><p style="text-align: center; font-weight: bold; margin-top: 8px; margin-bottom: 24px;">Figure 1: Geographic cluster assignments and house-value distributions from the final model</p></div>

The map shows that location drives broad geographic continuity, while the boxplots show that price still distinguishes clusters. For example, Cluster 3 has the highest mean house value, while Cluster 4 has the lowest. Some regions and price distributions overlap because K-means balances all three transformed inputs rather than imposing hard geographic boundaries or equal price ranges.

## Limitations

K-means assumes that Euclidean distance and mean-based centroids are meaningful. It tends to work best for compact, roughly spherical clusters of comparable scale, whereas California's geography is elongated and its housing markets can have irregular boundaries and unequal densities. Results also depend on \\(K\\), feature scaling, the 0.35 price weight, and initialization. Finally, the data describe 1990 census block groups, so these clusters should not be interpreted as current housing-market conditions.

## Takeaway

K-means provides a concise way to summarize 20,640 observations as six location-and-price groups. Standardization makes the three inputs comparable, the price weight encodes the project's preference for geographic continuity, and repeated K-means++ initializations improve the reliability of the numerical solution. The clusters are useful exploratory summaries, but their validity should be tested across alternative values of (K), feature weights, and clustering methods before they are treated as stable market regions.
