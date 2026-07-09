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
       style="width: 80%; height: auto; border-radius: 0; flex-shrink: 0;">
</div>

### Plot 2
<div class="member-block" style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
  <img src="/26-the-pattern-seekers/boxplot_sleep_by_refreshed.png"
       alt="box2"
       style="width: 80%; height: auto; border-radius: 0; flex-shrink: 0;">
</div>


## CDC Data Analysis

We conducted analysis on the correlation between obesity rates and cost of healthy living in counties in California.

### Data Acquisition

We downloaded the [PLACES](https://data.cdc.gov/500-Cities-Places/PLACES-County-Data-GIS-Friendly-Format-2025-releas/i46a-9kgh/about_data) CDC dataset (2025 release) for obesity rates in California counties.

We downloaded the [Living Wage](https://lab.data.ca.gov/dataset/living-wage/4fe5413a-7a82-4150-8492-342fbe844a45) dataset from the State of California Government website for living wages by county (hourly USD).

### Data Cleaning & Merging

We cleaned the **PLACES** dataset by
- dropping all missing values in the `OBESITY_AdjPrev` column, lowering the number of rows from 3143 to 2956 (~6% loss), and
- dropping all non-CA rows (by `StateAbbr`), lowering the number of rows to 58 (1.85% of the original size).

There were no missing values in the **Living Wage** dataset.

We then joined them by county, resulting in a final dataset with 58 rows and two features.

### Data Inspection

We started exploratory data inspection and found:

| Statistic | Adjusted Obesity Prevalence | Hourly Wage (USD) |
| --- | --- | --- |
| Mean | 29.981 | 20.325 |
| std | 4.277 | 2.098 |
| min | 17.100 | 17.480 |
| p25 | 27.600 | 18.713 |
| p50 | 30.350 | 19.620 |
| p75 | 32.400 | 21.403 |
| max | 37.900 | 25.440 |

For obesity:

- the top three most obese counties were **Fresno**, **Riverside**, and **Madera**,
- the top three least obese counties were **San Francisco**, **Marin**, and **Santa Clara**,
- the least-obese county (San Francisco) is 3.012 standard deviations away from the mean, exceeding the 1.96 limit (95% CI) and suggesting that this may be an outlier, and
- inland counties have higher obesity prevalences than coastal counties (see map below).

<div style="display: flex; align-items: flex-start; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
 <img src="/26-the-pattern-seekers/ca-obesity-map.jpg"
       alt="California Obesity Prevalence Map"
       style="width: 100%; height: auto; flex-shrink: 0; border-radius: 0px;">
</div>

For hourly wages:

- the top three counties with the highest hourly wages were **San Mateo**, **San Francisco**, and **Marin**,
- the top three counties with the least hourly wages were **Tulare**, **Glenn**, and **Sutter**,
- coastal counties have significantly higher hourly wages than inland counties (see map below).

<div style="display: flex; align-items: flex-start; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
 <img src="/26-the-pattern-seekers/ca-wage-map.jpg"
       alt="California Obesity Wage Map"
       style="width: 100%; height: auto; flex-shrink: 0; border-radius: 0px;">
</div>

### Correlation

We applied linear regression on the combined dataset, producing a PCC of -0.781. This suggests a relatively strong correlation between obesity and hourly wage; counties with higher hourly wages have lower obesity prevalence.

<div style="display: flex; align-items: flex-start; flex-wrap: wrap; margin-top: 5px; margin-bottom: 20px;">
 <img src="/26-the-pattern-seekers/living_wage_obesity_correlation.jpg"
       alt="California Obesity Prevalence Map"
       style="width: 100%; height: auto; flex-shrink: 0; border-radius: 0px;">
</div>

### Conclusion

We found a strong negative relationship between living wages and age-adjusted obesity prevalence across California counties. Counties with higher living wages generally had lower obesity rates, while many inland counties had both lower living wages and higher obesity rates than coastal counties. The Pearson correlation coefficient of -0.781 summarized this pattern across all 58 counties.

This result showed an association, not proof that living wages directly caused differences in obesity. Other factors—including food access, health care, transportation, education, and local demographics—may also have contributed to the county-level pattern. Even with that limitation, our analysis highlighted a meaningful geographic and economic disparity that could guide further research into how local conditions shaped public health.
