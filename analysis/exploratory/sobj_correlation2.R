# =====================================================================
# S_obj (religion only) and its correlation with D_geo
#
#   - geo_margin: how far apart the two nearest candidates are.
#     This is the moderator for the category-adjustment prediction
#     (social influence should grow as the margin shrinks).
#
# Run geodist_setup.R first. This picks up pairs from there, or reads
# geo_distances.csv if it is saved.
#
# NOTE: `contig` (shared border) is deliberately NOT in S_obj. It is a
# geographic feature, and putting it in the social index would
# contaminate the comparison. It stays within D_geo.
#
# Sections:
#   1  religion table (Pew 2020)
#   2  pairwise religious similarity - the same formula the norming
#      data will use
#   3  build the predictor file
#   4  the correlation: overall and within reference country
#   5  does the Consistent / Inconsistent split survive?
#   6  plots and output
#   7  the S_perc rule, written out for norming data
# =====================================================================

library(haven)
library(dplyr)
library(tidyr)
library(ggplot2)
library(tibble)


# ---------------------------------------------------------------------
# 1. RELIGION TABLE
#
# Pew Research, Global Religious Landscape, 2020 estimates, published
# June 2025. Appendix B, "Religious composition table":
# https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/
#
# "Other" = Buddhist + Hindu + Jewish + other religions, summed from
# Pew's rounded component columns. Values Pew printed as "<0.1" are
# entered as 0.05 here; the renormalisation absorbs the rounding.
#
# TWO THINGS TO CHECK BEFORE PREREGISTER:
#   - Cyprus. Pew reports the whole island. For Republic of Cyprus,
#     the Muslim population is far lower.
#   - Sudan. These are post-2011 borders (South Sudan separate). PROBLEM??
#     Make sure that matches the GeoDist vintage you pulled distances from
#     at minimum.
# ---------------------------------------------------------------------

religion <- tibble::tribble(
  ~iso,   ~country,          ~christian, ~muslim, ~unaffiliated, ~other,
  "DEU",  "Germany",               56.2,     6.5,          36.1,    1.0,
  "PAK",  "Pakistan",               1.3,    96.5,          0.05,    2.1,
  "ESP",  "Spain",                 69.5,     3.6,          26.4,    0.5,
  "GBR",  "United Kingdom",        49.4,     6.4,          40.2,    4.0,
  "CYP",  "Cyprus",                67.7,    24.4,           6.6,    1.4,
  "IRQ",  "Iraq",                   0.4,    99.5,          0.05,    0.1,
  "SDN",  "Sudan",                  0.5,    98.9,           0.6,   0.05,
  "ARM",  "Armenia",               97.3,     0.3,           1.2,    1.2,
  "EGY",  "Egypt",                  4.8,    95.2,          0.05,   0.05,
  "MAR",  "Morocco",               0.05,    99.7,           0.1,    0.1,
  "AFG",  "Afghanistan",           0.05,    99.9,          0.05,   0.05,
  "GRC",  "Greece",                89.5,     5.1,           4.7,    0.5,
  "NGA",  "Nigeria",               43.4,    56.1,           0.4,    0.2,
  "POL",  "Poland",                91.2,    0.05,           8.6,    0.1,
  "TUR",  "Turkey",                 0.1,    97.1,           2.5,    0.1
)

# renormalise each row to sum to 1 (Pew rounds each cell independently)
relig_mat <- religion |>
  select(christian, muslim, unaffiliated, other) |>
  as.matrix()
rownames(relig_mat) <- religion$iso
relig_mat <- relig_mat / rowSums(relig_mat)

round(relig_mat, 3)


# ---------------------------------------------------------------------
# 2. PAIRWISE RELIGIOUS SIMILARITY
#
# 1 - total variation distance between the two composition vectors:
#     sim = 1 - 0.5 * sum |p_i - q_i|
# Runs from 0 (disjoint profiles) to 1 (identical). This is the same formula
# applied to the norming data, so S_obj and S_perc are directly comparable.
# Section 7 applies it to the norming data.
# ---------------------------------------------------------------------

tv_sim <- function(p, q) 1 - 0.5 * sum(abs(p - q))

religion_sim <- function(iso_a, iso_b) {
  mapply(function(a, b) tv_sim(relig_mat[a, ], relig_mat[b, ]), iso_a, iso_b)
}

# sanity check: identical profiles -> 1, opposite -> near 0
tv_sim(relig_mat["AFG", ], relig_mat["AFG", ])    # 1
religion_sim("MAR", "POL")                        # near 0
religion_sim("EGY", "TUR")                        # high

# ---------------------------------------------------------------------
# 3. PREDICTOR FILE
#
#     Everything is computed WITHIN reference country, because each
#     trial asks the participant to order the five candidates offered
#     on that trial.
# ---------------------------------------------------------------------

# if `pairs` is not in the environment, rebuild it from geodist_setup.R
if (!exists("pairs")) stop("Run geodist_setup.R first.")

preds <- pairs |>
  select(ref_name, comp_name, condition, iso_o, iso_d,
         km_distw = distw, km_distcap = distcap) |>
  mutate(
    sim_religion = religion_sim(iso_o, iso_d),
    
    # --- geography, on scale ---
    log_distw    = log(km_distw)
  ) |>
  group_by(ref_name) |>
  mutate(
    z_log_distw = as.numeric(scale(log_distw)),     # within reference country
    z_sim_relig = as.numeric(scale(sim_religion)),
    
    # continuous ranks among the five candidates. 1 = nearest / most
    # similar. Kept for description and for the conditional-logit model
    # of first placement; NOT used to label items.
    geo_rank    = rank(km_distw,      ties.method = "average"),
    relig_rank  = rank(-sim_religion, ties.method = "average"),
    
    # how far apart the two geographically nearest candidates are,
    # as a proportion of the nearest. Small = the metric answer is
    # nearly a coin flip, which is where substitution should show.
    geo_margin  = (sort(km_distw)[2] - min(km_distw)) / min(km_distw)
  ) |>
  ungroup()

print(preds |>
        select(condition, ref_name, comp_name, km_distw, sim_religion,
               geo_rank, relig_rank) |>
        arrange(condition, ref_name, geo_rank), n = 50)


# ---------------------------------------------------------------------
# 4. CORRELATION
#
#  Two versions:
#
#  (a) OVERALL, across all 50 pairs. Mixes two sources of variation:
#      differences between reference countries, and differences among
#      the five candidates within a reference country.
#
#  (b) WITHIN reference country. DV is a ranking of five candidates on
#      a single trial, so within-trial variation drives it.
# ---------------------------------------------------------------------

# (a) overall: descriptive only
preds |>
  summarise(pearson  = cor(log_distw, sim_religion),
            spearman = cor(log_distw, sim_religion, method = "spearman"))

# (b) within reference country: the one that matters
cor_within <- preds |>
  group_by(ref_name, condition) |>
  summarise(r_relig    = cor(log_distw, sim_religion, method = "spearman"),
            geo_margin = first(geo_margin),
            .groups = "drop") |>
  arrange(condition, r_relig)

cor_within

cor_within |>
  group_by(condition) |>
  summarise(mean_r = mean(r_relig), min_r = min(r_relig), max_r = max(r_relig))

# Read results:
#   near -1  closer countries are also more socially similar, so the cues
#            agree, and this item cannot separate the accounts.
#   near  0  the cues are orthogonal: this item has full diagnostic power
#   near +1  closer countries are LESS socially similar: the cues are
#            opposed.
#
# Consistent items should sit near -1. Inconsistent items should sit
# near 0 or positive. If they don't, the labels are wrong.


# ---------------------------------------------------------------------
# 5. WHAT ABOUT THE CONDITION SPLIT?
#
#     The binary label is a convenience. The continuous r_relig is the
#     real description of cue conflict, and it is what the prereg
#     should report. The check below only asks whether the two groups
#     separate; it does not assign labels item by item.
# ---------------------------------------------------------------------

# do the groups separate?
with(cor_within, wilcox.test(r_relig ~ condition))

# any item whose correlation sits in the other group's range is worth
# a second look -- a flag for discussion, not an automatic exclusion
rng <- cor_within |> group_by(condition) |>
  summarise(lo = min(r_relig), hi = max(r_relig), .groups = "drop")

cor_within |>
  rowwise() |>
  mutate(overlaps_other_group = {
    other <- rng |> filter(condition != cur_data()$condition)
    r_relig >= other$lo && r_relig <= other$hi
  }) |>
  ungroup() |>
  filter(overlaps_other_group)

# margin spread
preds |> distinct(ref_name, condition, geo_margin) |>
  arrange(geo_margin) |>
  mutate(margin_pct = round(geo_margin * 100))


# ---------------------------------------------------------------------
# 6. PLOTS AND OUTPUT
# ---------------------------------------------------------------------

# the headline scatter, one panel per reference country
ggplot(preds, aes(x = log_distw, y = sim_religion, colour = condition)) +
  geom_point(size = 2) +
  geom_text(aes(label = comp_name), hjust = -0.12, size = 2.6, show.legend = FALSE) +
  geom_smooth(method = "lm", se = FALSE, linewidth = 0.4, colour = "grey50") +
  facet_wrap(~ ref_name, scales = "free_x") +
  expand_limits(x = max(preds$log_distw) + 0.9) +
  labs(x = "log population-weighted distance (km)",
       y = "religious-composition similarity",
       title = "Do geography and social features converge?",
       subtitle = "A downward slope means the cues agree and the item is weak") +
  theme_minimal() +
  theme(legend.position = "bottom")

# the same correlations as a ranked bar chart, so the split is visible
ggplot(cor_within, aes(reorder(ref_name, r_relig), r_relig, fill = condition)) +
  geom_col() +
  geom_hline(yintercept = 0, linewidth = 0.3) +
  coord_flip() +
  labs(x = NULL, y = "within-item Spearman r (distance vs religion similarity)",
       title = "Consistent items should sit near -1, Inconsistent near 0 or above") +
  theme_minimal()

write.csv(preds, "predictors_geo_religion.csv", row.names = FALSE)


# ---------------------------------------------------------------------
# 7. THE S_perc RULE
#
#     Written for the norming data.
#
#     Expected input: one row per norming participant per country, with
#     the four religion sliders. Adapt the column names, not the method.
#
#       norming <- read.csv("norming_religion.csv")
#       # columns: participant, iso, christian, muslim, nonreligious, other
#
#     Step 1: item-level perceived profile = mean across participants
#     Step 2: renormalise each profile to sum to 1
#     Step 3: same tv_sim() as above, applied pairwise
# ---------------------------------------------------------------------

perceived_profiles <- function(norming,
                               cols = c("christian", "muslim",
                                        "nonreligious", "other")) {
  m <- norming |>
    group_by(iso) |>
    summarise(across(all_of(cols), ~ mean(.x, na.rm = TRUE)), .groups = "drop")
  
  out <- as.matrix(m[, cols])
  rownames(out) <- m$iso
  out / rowSums(out)
}

perceived_sim <- function(profiles, iso_a, iso_b)
  mapply(function(a, b) tv_sim(profiles[a, ], profiles[b, ]), iso_a, iso_b)

# When the norming data is generated:
#
#   P <- perceived_profiles(read.csv("norming_religion.csv"))
#   preds <- preds |>
#     mutate(sim_religion_perc = perceived_sim(P, iso_o, iso_d)) |>
#     group_by(ref_name) |>
#     mutate(z_sim_relig_perc = as.numeric(scale(sim_religion_perc))) |>
#     ungroup()
#
#   # calibration: do perceptions track the Pew figures?
#   cor(preds$sim_religion, preds$sim_religion_perc)
#
#   # and the collinearity check that decides whether the design can work
#   preds |> group_by(ref_name) |>
#     summarise(r = cor(log_distw, sim_religion_perc, method = "spearman"))