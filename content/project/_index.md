---
title: "Projects"
author: "Pattern Seekers"
---
## Mini Manual Survey

This is an example of a project we conducted to see sleep schedules relative to how refreshed students were, generating multiple bar plots to visualize. The data was constructed from a Google Form and is an example of data acquisition.

### Plot 1
<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
 <img src="/26-the-pattern-seekers/boxplot_refreshed_by_sleep_int.png"
       alt="box1"
       style="width: 500px; height: auto; border-radius: 12px; flex-shrink: 0;">
</div>

### Plot 2
<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
  <img src="/26-the-pattern-seekers/boxplot_sleep_by_refreshed.png"
       alt="box2"
       style="width: 500px; height: auto; border-radius: 12px; flex-shrink: 0;">
</div>


## CDC Data Analysis

### Data Acquisition

We downloaded the [PLACES](https://data.cdc.gov/500-Cities-Places/PLACES-County-Data-GIS-Friendly-Format-2025-releas/i46a-9kgh/about_data) CDC dataset (2025 release) to conduct analysis on the correlation between obesity rates and cost of healthy living in counties in California.

### Data Cleaning

We cleaned the data by
- dropping all missing values in the `OBESITY_AdjPrev` column, lowering the number of rows from 3143 to 2956 (~6% loss), and
- dropping all non-CA rows (by `StateAbbr`), lowering the number of rows to 58 (1.85% of the original size).

### Data Inspection

We started exploratory data inspection and found:

| Statistic (Adjusted Obesity Prevalence) | Value |
| --- | --- |
| Mean | 29.981 |
| std | 4.277 |
| min (San Francisco) | 17.100 |
| p25 | 27.600 |
| p50 | 30.350 |
| p75 | 32.400 |
| max (Fresno) | 37.900 |

Additionally, the top three most obese counties were **Fresno**, **Riverside**, and **Madera**, and the top three least obese counties were **San Francisco**, **Marin**, and **Santa Clara**.