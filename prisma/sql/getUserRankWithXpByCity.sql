-- @param {String} $1:start_date Start date
-- @param {String} $2:end_date End date
-- @param {Int} $3:city_id City id
-- @param {Int} $4:limit Limit of the query
SELECT
    `User`.`id`,
    `User`.`avatar`,
    `User`.`name`,
    `User`.`school`,
    `User`.`class`,
    `User`.`created_at`,
    SUM(ScanMetric.max_scan_xp) AS scan_xp_total,
    MIN(ScanMetric.first_reach_date) AS first_reach_date, 
    RANK() OVER (ORDER BY SUM(ScanMetric.max_scan_xp) DESC, MIN(ScanMetric.first_reach_date) ASC) AS rank
FROM
    `User`
    LEFT JOIN (
        SELECT 
            user_id,
            scan_id,
            MAX(scan_xp) AS max_scan_xp,
            MIN(created_at) AS first_reach_date
        FROM 
            ScanMetric
        WHERE 
            `created_at` >= ?
            AND `created_at` <= ?
        GROUP BY 
            user_id, scan_id
    ) AS ScanMetric ON `User`.id = ScanMetric.user_id
WHERE
    `User`.`city_id` = ?
GROUP BY
    `User`.id
ORDER BY
    scan_xp_total DESC,
    first_reach_date ASC,
    created_at ASC 
LIMIT ?;
