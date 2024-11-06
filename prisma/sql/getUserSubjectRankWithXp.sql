-- @param {String} $1:subject Subject
-- @param {Int} $2:limit Limit of the query
SELECT
	`User`.`name`,
	`User`.school,
	`User`.class,
	SUM(ScanMetric.scan_xp) AS scan_xp_total,
	`User`.id,
	RANK() OVER (
		ORDER BY
			SUM(ScanMetric.scan_xp) DESC
	) AS rank
FROM
	`User`
	LEFT JOIN ScanMetric ON `User`.id = ScanMetric.user_id
	AND ScanMetric.`subject` = ?
GROUP BY
	`User`.id
ORDER BY
	scan_xp_total DESC
LIMIT
	?;