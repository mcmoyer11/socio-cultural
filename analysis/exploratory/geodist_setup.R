# =====================================================================
# CEPII GeoDist -> distance matrix for the country ranking task
#
# File: dist_cepii.dta   (the dyadic file: one row per country
# pair). 
#
# Run top to bottom. Sections:
#   1  load and inspect the file
#   2  see what the columns mean (Stata variable labels)
#   3  pull out your 10 x 5 pairs
#   4  check nothing is missing
#   5  compare the four distance measures
#   6  look at the matrix
#   7  write the file for analysis
# =====================================================================

# install.packages(c("haven", "dplyr", "tidyr", "ggplot2", "tibble"))

library(haven)     # reads .dta
library(dplyr)
library(tidyr)
library(ggplot2)
library(tibble)


# ---------------------------------------------------------------------
# 1. LOAD AND INSPECT
# ---------------------------------------------------------------------

# edit to wherever you unzipped it
dist_path <- "dist_cepii.dta"

dist_raw <- read_dta(dist_path)

dim(dist_raw)        # ~ 50,000 rows: every ordered country pair
names(dist_raw)
glimpse(dist_raw)

# first few rows, for shape of a dyadic file
head(as.data.frame(dist_raw), 10)


# ---------------------------------------------------------------------
# 2. WHAT THE COLUMNS MEAN
#    Stata files carry variable labels. This Prints
# ---------------------------------------------------------------------

var_labels <- sapply(dist_raw, function(x) {
  lab <- attr(x, "label")
  if (is.null(lab)) NA_character_ else lab
})

tibble(variable = names(var_labels), label = as.character(var_labels)) |>
  print(n = Inf)

# The four distance columns per CEPII:
#   dist      distance between the most populated cities of each country
#   distcap   distance between the two capitals
#   distw     population-weighted: averages over internal city distances
#   distwces  population-weighted, CES form (theta = -1)
# All in kilometres, all great-circle.
#
# distw / distwces are the ones that handle large, population-dispersed
# countries sensibly, which matters here for Nigeria and Turkey.


# ---------------------------------------------------------------------
# 3. PAIRS
# ---------------------------------------------------------------------

reference <- tibble::tribble(
  ~ref_name,         ~iso_o,  ~condition,
  "Germany",         "DEU",   "Consistent",
  "Pakistan",        "PAK",   "Consistent",
  "Spain",           "ESP",   "Consistent",
  "United Kingdom",  "GBR",   "Consistent",
  "Cyprus",          "CYP",   "Inconsistent",
  "Iraq",            "IRQ",   "Inconsistent",
  "Sudan",           "SDN",   "Inconsistent",
  "Armenia",         "ARM",   "Inconsistent",
  "Egypt",           "EGY",   "Inconsistent",
  "Morocco",         "MAR",   "Inconsistent"
)

comparison <- tibble::tribble(
  ~comp_name,     ~iso_d,
  "Afghanistan",  "AFG",
  "Greece",       "GRC",
  "Nigeria",      "NGA",
  "Poland",       "POL",
  "Turkey",       "TUR"
)

# Rows in dist_cepii are directed (both A->B and B->A are present), so
# filtering reference as origin and comparison as destination gives
# exactly 10 x 5 = 50 rows.
pairs <- dist_raw |>
  filter(iso_o %in% reference$iso_o,
         iso_d %in% comparison$iso_d) |>
  select(iso_o, iso_d, contig, dist, distcap, distw, distwces) |>
  mutate(across(c(dist, distcap, distw, distwces), as.numeric)) |>
  left_join(reference,  by = "iso_o") |>
  left_join(comparison, by = "iso_d") |>
  relocate(ref_name, comp_name, condition)

nrow(pairs)   # expect 50
pairs


# ---------------------------------------------------------------------
# 4. CHECK NOTHING IS MISSING
#    Sudan PROBLEM: depending on the GeoDist vintage, SDN
#    may be pre-2011 Sudan, and some vintages add SSD separately.
# ---------------------------------------------------------------------

expected <- tidyr::crossing(iso_o = reference$iso_o, iso_d = comparison$iso_d)

missing_pairs <- anti_join(expected, pairs, by = c("iso_o", "iso_d"))
missing_pairs            # should be 0 rows

colSums(is.na(pairs))    # should be 0 for the distance columns


# ---------------------------------------------------------------------
# 5. COMPARE FOUR MEASURES
#    This is the preregistration decision: if they are near-collinear,
#    the choice of measure cannot drive result.
# ---------------------------------------------------------------------

dist_cols <- pairs |> select(dist, distcap, distw, distwces)

round(cor(dist_cols, method = "pearson"),  3)
round(cor(dist_cols, method = "spearman"), 3)   # rank correlation is
# what matters

# on the log scale
round(cor(log(dist_cols)), 3)

pairs(dist_cols, main = "CEPII distance measures, 50 pairs")

# how much would the implied correct ranking differ by measure?
rank_by <- function(d) {
  pairs |>
    mutate(dv = d) |>
    group_by(ref_name) |>
    arrange(dv, .by_group = TRUE) |>
    summarise(order = paste(comp_name, collapse = " > "), .groups = "drop")
}

compare_orders <- rank_by(pairs$distw) |>
  rename(order_distw = order) |>
  left_join(rank_by(pairs$distcap) |> rename(order_distcap = order),
            by = "ref_name") |>
  mutate(same = order_distw == order_distcap)

compare_orders        # TRUE everywhere = the choice is immaterial


# ---------------------------------------------------------------------
# 6. VISUALIZE
# ---------------------------------------------------------------------

# the 10 x 5 matrix, as a table
pairs |>
  select(ref_name, comp_name, distw) |>
  pivot_wider(names_from = comp_name, values_from = distw) |>
  mutate(across(where(is.numeric), ~ round(.x)))

# heatmap, ordered by condition
pairs |>
  mutate(ref_name = factor(ref_name, levels = reference$ref_name)) |>
  ggplot(aes(x = comp_name, y = ref_name, fill = distw)) +
  geom_tile(colour = "white") +
  geom_text(aes(label = round(distw)), size = 3) +
  facet_grid(condition ~ ., scales = "free_y", space = "free_y") +
  scale_fill_viridis_c(trans = "log", name = "km (log)") +
  labs(x = "Comparison country", y = "Reference country",
       title = "Population-weighted great-circle distance (distw)") +
  theme_minimal()

# which comparison country is geographically nearest to each reference?
pairs |>
  group_by(ref_name, condition) |>
  slice_min(distw, n = 1) |>
  select(condition, ref_name, nearest = comp_name, km = distw) |>
  arrange(condition, ref_name)


# ---------------------------------------------------------------------
# 7. THE JOIN FILE
#    One row per reference x comparison pair, with the predictors.
# ---------------------------------------------------------------------

geo <- pairs |>
  transmute(
    ref_name, comp_name, condition,
    iso_o, iso_d,
    contig      = as.integer(contig),
    km_distw    = distw,
    km_distcap  = distcap,
    log_distw   = log(distw),
    # z-scored WITHIN reference country: the model compares the five
    # candidates offered on a given trial, not distances across trials
    z_log_distw = as.numeric(scale(log(distw)))
  ) |>
  group_by(ref_name) |>
  mutate(z_log_distw_within = as.numeric(scale(log(km_distw))),
         geo_rank           = rank(km_distw, ties.method = "min")) |>
  ungroup()

geo

write.csv(geo, "geo_distances.csv", row.names = FALSE)