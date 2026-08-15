-- Migration 013: News article credits (reporter name + report date)
--
-- Both are optional: articles created before this, and articles where the station
-- doesn't want a byline, simply leave them null and render no credit line.

ALTER TABLE news
  ADD COLUMN reporter_name VARCHAR(160),
  ADD COLUMN report_date   DATE;
